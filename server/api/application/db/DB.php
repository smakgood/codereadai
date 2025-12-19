<?php
class DB
{
    private $pdo;
    function __construct()
    {
        $host = '127.0.0.1';// ip для подключения к бд
        $port = '3306';// порт 
        $user = 'root';// логин для входа в бд
        $pass = ''; // пароль для бд
        $db = 'codereadai';// название базы данных 
        $connect = "mysql:host=$host;port=$port;dbname=$db;charset=utf8";// формирование команды для подключения к базе данных
        // cоздаем объект PDO для работы с БД
        $this->pdo = new PDO($connect, $user, $pass);
    }

    public function __destruct()
    {
        $this->pdo = null;
    }

    // выполнить запрос без возвращения данных, базовый метод для работы с Бд
    public function execute($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql); // Подготавливаем запрос
        return $sth->execute($params); // Выполняем с параметрами
    }

    // получение ОДНОЙ записи
    public function query($sql, $params = [])
    {
        $sth = $this->pdo->prepare($sql);
        $sth->execute($params);
        return $sth->fetch(PDO::FETCH_OBJ);
    }

    // получение НЕСКОЛЬКИХ записей
    public function queryAll($sql, $params = [])
    {
        try {
            $sth = $this->pdo->prepare($sql);
            $success = $sth->execute($params);
            if (!$success) {
                error_log("SQL Error in queryAll: " . implode(", ", $sth->errorInfo()));
                return false;
            }
            $result = $sth->fetchAll(PDO::FETCH_OBJ);
            return $result !== false ? $result : [];
        } catch (PDOException $e) {
            error_log("PDO Error in queryAll: " . $e->getMessage());
            return false;
        }
    }

    /*public function getUserByLogin($name) {
        return $this->query("SELECT * FROM users WHERE login=?", [$name]);
    }*/

    public function getUserById($userId)
    {
        return $this->query("SELECT id, email, name, token, xp_points FROM users WHERE id=?", [$userId]);
    }

    public function getUserByEmail($email)
    {
        return $this->query("SELECT * FROM users WHERE email=?", [$email]);
    }

    public function getUserByToken($token)
    {
        return $this->query("SELECT * FROM users WHERE token=?", [$token]);
    }

    public function updateToken($userId, $token)
    {
        $this->execute("UPDATE users SET token=? WHERE id=?", [$token, $userId]);
    }

    public function updateUserName($userId, $newName)
    {
        return $this->execute("UPDATE users SET name=? WHERE id=?", [$newName, $userId]);
    }
    public function isNameUnique($name, $excludingUserId = null)
    {
        $sql = "SELECT COUNT(*) FROM users WHERE name = ?";
        $params = [$name];

        if ($excludingUserId !== null) {
            // Если указан ID, исключаем его из проверки (пользователь может сохранить свое имя)
            $sql .= " AND id != ?";
            $params[] = $excludingUserId;
        }

        // Выполняем запрос и возвращаем true, если COUNT(*) равен 0 (имя уникально)
        $count = $this->query($sql, $params)->{'COUNT(*)'};
        return $count == 0;
    }

    public function registration($email, $password, $name)
    {
        $this->execute(
            "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
            [$email, $password, $name]
        );
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ЗАДАЧАМИ ==========
    
    /**
     * Получить список всех опубликованных задач
     */
    public function getTasks($languageId = null, $difficulty = null)
    {
        $sql = "SELECT t.id, t.title, t.description, t.difficulty, 
                       l.name as language_name, l.slug as language_slug 
                FROM tasks t 
                JOIN languages l ON t.language_id = l.id 
                WHERE t.is_published = 1";
        $params = [];
        
        if ($languageId) {
            $sql .= " AND t.language_id = ?";
            $params[] = $languageId;
        }
        
        if ($difficulty) {
            $sql .= " AND t.difficulty = ?";
            $params[] = $difficulty;
        }
        
        $sql .= " ORDER BY t.created_at DESC";
        
        return $this->queryAll($sql, $params);
    }

    /**
     * Получить задачу по ID
     */
    public function getTaskById($taskId)
    {
        return $this->query(
            "SELECT t.id, t.title, t.description, t.code_snippet as code, t.difficulty, 
                    t.reference_explanation,
                    l.name as language_name, l.slug as language_slug 
             FROM tasks t 
             LEFT JOIN languages l ON t.language_id = l.id 
             WHERE t.id = ? AND t.is_published = 1",
            [$taskId]
        );
    }

    // ========== МЕТОДЫ ДЛЯ РАБОТЫ С SUBMISSIONS И REVIEWS ==========

    /**
     * Создать submission (отправку задания пользователем)
     */
    public function createSubmission($userId, $taskId, $userText)
    {
        $sql = "INSERT INTO submissions (user_id, task_id, user_text, status) VALUES (?, ?, ?, 'pending')";
        $this->execute($sql, [$userId, $taskId, $userText]);
        return $this->pdo->lastInsertId();
    }

    /**
     * Получить submission по ID
     */
    public function getSubmissionById($submissionId)
    {
        return $this->query(
            "SELECT id, user_id, task_id, user_text, status, created_at 
             FROM submissions 
             WHERE id = ?",
            [$submissionId]
        );
    }

    /**
     * Получить последний submission пользователя для задачи
     */
    public function getSubmissionByUserAndTask($userId, $taskId)
    {
        return $this->query(
            "SELECT id, user_id, task_id, user_text, status, created_at 
             FROM submissions 
             WHERE user_id = ? AND task_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1",
            [$userId, $taskId]
        );
    }

    /**
     * Обновить статус submission
     */
    public function updateSubmissionStatus($submissionId, $status)
    {
        return $this->execute(
            "UPDATE submissions SET status = ? WHERE id = ?",
            [$status, $submissionId]
        );
    }

    /**
     * Создать review (результат проверки AI)
     */
    public function createReview($submissionId, $score, $aiFeedbackJson)
    {
        $sql = "INSERT INTO reviews (submission_id, score, ai_feedback_json) VALUES (?, ?, ?)";
        return $this->execute($sql, [$submissionId, $score, json_encode($aiFeedbackJson)]);
    }

    /**
     * Получить review по submission_id
     */
    public function getReviewBySubmissionId($submissionId)
    {
        return $this->query(
            "SELECT id, submission_id, score, ai_feedback_json, created_at 
             FROM reviews 
             WHERE submission_id = ?",
            [$submissionId]
        );
    }
}