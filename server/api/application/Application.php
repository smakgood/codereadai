<?php
require_once('db/DB.php');
require_once('user/User.php');
require_once('ai/AIService.php');

class Application
{
    private $user;
    private $db;
    private $aiService;

    function __construct()
    {
        $db = new DB();
        $this->db = $db;
        $this->user = new User($db);
        $this->aiService = new AIService();
    }

    public function login($params)
    {
        if ($params['email'] && $params['hash'] && $params['rnd']) {
            return $this->user->login($params['email'], $params['hash'], $params['rnd']);

        }

        return ['error' => 242];
    }

    public function logout($params)
    {
        if ($params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->user->logout($params['token']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    /**
     * Получить текущего пользователя по токену
     * Используется для проверки валидности сессии при перезагрузке страницы
     */
    public function getCurrentUser($params)
    {
        if (isset($params['token']) && $params['token']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return [
                    'id' => (int)$user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'balance' => isset($user->balance) ? (int)$user->balance : 0,
                    'token' => $params['token']
                ];
            }
            return ['error' => 705]; // Не авторизован
        }
        return ['error' => 242]; // Параметры не указаны
    }

    public function registration($params)
    {

        if ($params['email'] && !filter_var($params['email'], FILTER_VALIDATE_EMAIL)) {
            return ['error' => 242];
        }

        if ($params['email'] && $params['password'] && $params['name']) {
            // Пароль уже приходит хешированный с клиента
            return $this->user->registration($params['email'], $params['password'], $params['name']);
        }
        return ['error' => 242];
    }

    // Обновление имени
    public function updateUserName($params)
    {
        if ($params['token'] && $params['newName']) {
            $user = $this->user->getUser($params['token']);
            if ($user) {
                return $this->user->updateUserName($user->id, $params['newName']);
            }
            return ['error' => 705];
        }
        return ['error' => 242];
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ЗАДАЧАМИ ==========
    
    /**
     * Получить список задач
     */
    public function getTasks($params)
    {
        $languageId = isset($params['language_id']) ? (int)$params['language_id'] : null;
        $difficulty = isset($params['difficulty']) ? $params['difficulty'] : null;
        
        $tasks = $this->db->getTasks($languageId, $difficulty);
        
        // Если запрос вернул false, значит была ошибка
        if ($tasks === false) {
            return ['error' => 9000];
        }
        
        // Если задач нет, возвращаем пустой массив
        if (empty($tasks)) {
            return [];
        }
        
        // Преобразуем объекты в массивы для JSON
        $result = [];
        foreach ($tasks as $task) {
            $result[] = [
                'id' => (int)$task->id,
                'title' => $task->title,
                'description' => $task->description,
                'language_name' => $task->language_name,
                'language_slug' => $task->language_slug,
                'difficulty' => $task->difficulty
            ];
        }
        
        return $result;
    }

    /**
     * Получить задачу по ID
     */
    public function getTaskById($params)
    {
        if (!isset($params['task_id'])) {
            return ['error' => 242]; // Params not set fully
        }

        $taskId = (int)$params['task_id'];
        $task = $this->db->getTaskById($taskId);
        
        if (!$task) {
            return ['error' => 404]; // Task not found
        }
        
        return [
            'id' => (int)$task->id,
            'title' => $task->title,
            'description' => $task->description,
            'code' => $task->code,
            'language_name' => $task->language_name,
            'language_slug' => $task->language_slug,
            'difficulty' => $task->difficulty
        ];
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С SUBMISSIONS И AI ==========

    /**
     * Отправить задание на проверку AI
     */
    public function submitTask($params)
    {
        // Проверка авторизации
        if (!isset($params['token'])) {
            return ['error' => 242]; // Params not set fully
        }

        $user = $this->user->getUser($params['token']);
        if (!$user) {
            return ['error' => 705]; // User not found / not authorized
        }

        // Валидация входных данных
        $userText = isset($params['user_description']) ? $params['user_description'] : (isset($params['user_text']) ? $params['user_text'] : null);
        
        if (!isset($params['task_id']) || !$userText) {
            return ['error' => 242]; // Params not set fully
        }

        $taskId = (int)$params['task_id'];
        $userText = trim($userText);

        if (empty($userText)) {
            return ['error' => 242]; // Empty user text
        }

        // Получить задание из БД
        $task = $this->db->getTaskById($taskId);
        if (!$task) {
            return ['error' => 404]; // Task not found
        }

        // Проверить наличие reference_explanation
        if (empty($task->reference_explanation)) {
            return ['error' => 9001, 'text' => "Task {$taskId} has no reference explanation"];
        }

        // Создать submission
        $submissionId = $this->db->createSubmission($user->id, $taskId, $userText);
        
        if (!$submissionId) {
            return ['error' => 9002, 'text' => "Failed to create submission in database"];
        }

        // Вызвать AI для проверки
        $aiResult = $this->aiService->evaluateSubmission(
            $task->code,
            $userText,
            $task->reference_explanation,
            $task->language_name
        );

        if (isset($aiResult['error'])) {
            // Ошибка AI API - обновляем статус на error
            $this->db->updateSubmissionStatus($submissionId, 'error');
            return ['error' => 9003, 'text' => "AI Service error: " . $aiResult['error']];
        }

        // Сохранить результат в reviews
        $reviewCreated = $this->db->createReview($submissionId, $aiResult['score'], $aiResult);
        
        if (!$reviewCreated) {
            $this->db->updateSubmissionStatus($submissionId, 'error');
            return ['error' => 9004, 'text' => "Failed to save AI review to database"];
        }

        // Обновить статус submission на completed
        $this->db->updateSubmissionStatus($submissionId, 'completed');

        return [
            'submission_id' => (int)$submissionId,
            'score' => (int)$aiResult['score'],
            'feedback' => $aiResult['feedback'],
            'strengths' => $aiResult['strengths'],
            'weaknesses' => $aiResult['weaknesses'],
            'suggestions' => $aiResult['suggestions'],
            'status' => 'completed'
        ];
    }

    /**
     * Получить статус submission
     */
    public function getSubmissionStatus($params)
    {
        if (!isset($params['submission_id'])) {
            return ['error' => 242]; // Params not set fully
        }

        $submissionId = (int)$params['submission_id'];
        $submission = $this->db->getSubmissionById($submissionId);

        if (!$submission) {
            return ['error' => 404]; // Submission not found
        }

        return [
            'id' => (int)$submission->id,
            'user_id' => (int)$submission->user_id,
            'task_id' => (int)$submission->task_id,
            'user_text' => $submission->user_text,
            'status' => $submission->status,
            'created_at' => $submission->created_at
        ];
    }

    /**
     * Получить результат проверки (review)
     */
    public function getSubmissionReview($params)
    {
        if (!isset($params['submission_id'])) {
            return ['error' => 242]; // Params not set fully
        }

        $submissionId = (int)$params['submission_id'];
        $review = $this->db->getReviewBySubmissionId($submissionId);

        if (!$review) {
            return ['error' => 404]; // Review not found
        }

        $feedbackJson = json_decode($review->ai_feedback_json, true);
        if (!$feedbackJson) {
            error_log("getSubmissionReview: Failed to decode JSON for review {$review->id}");
            return ['error' => 9000];
        }

        return [
            'id' => (int)$review->id,
            'submission_id' => (int)$review->submission_id,
            'score' => (int)$review->score,
            'feedback' => $feedbackJson['feedback'] ?? '',
            'strengths' => $feedbackJson['strengths'] ?? [],
            'weaknesses' => $feedbackJson['weaknesses'] ?? [],
            'suggestions' => $feedbackJson['suggestions'] ?? [],
            'created_at' => $review->created_at
        ];
    }

}