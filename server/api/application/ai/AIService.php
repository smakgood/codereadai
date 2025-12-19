<?php

class AIService
{
    private $apiKey;
    private $apiUrl;
    private $model;
    private $timeout;

    public function __construct($apiKey = null, $apiUrl = null, $model = null, $timeout = 60)
    {
        $this->apiKey = $apiKey ?: getenv('AI_API_KEY') ?: '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';
        $this->apiUrl = $apiUrl ?: getenv('AI_API_URL') ?: 'https://openrouter.ai/api/v1/chat/completions';
        $this->model = $model ?: getenv('AI_MODEL') ?: 'nvidia/nemotron-3-nano-30b-a3b:free';
        $this->timeout = $timeout;
    }

    /**
     * Оценить описание пользователя с помощью AI
     * 
     * @param string $code Код задания
     * @param string $userDescription Описание пользователя
     * @param string $referenceExplanation Эталонное объяснение
     * @param string $language Язык программирования
     * @return array Массив с результатом или ['error' => '...'] при ошибке
     */
    public function evaluateSubmission($code, $userDescription, $referenceExplanation, $language)
    {
        if (empty($this->apiKey)) {
            return ['error' => 'API key is missing'];
        }

        $prompt = $this->buildPrompt($code, $userDescription, $referenceExplanation, $language);
        return $this->makeRequest($prompt);
    }

    /**
     * Построить промпт для AI
     */
    private function buildPrompt($code, $userDescription, $referenceExplanation, $language)
    {
        return "Ты - опытный наставник по программированию. Твоя задача — оценить, насколько точно пользователь описал работу предоставленного кода.

КОД ДЛЯ АНАЛИЗА:
{$code}

ЭТАЛОННОЕ ОБЪЯСНЕНИЕ (для твоей справки):
{$referenceExplanation}

ОПИСАНИЕ ПОЛЬЗОВАТЕЛЯ:
{$userDescription}

ЯЗЫК ПРОГРАММИРОВАНИЯ: {$language}

ИНСТРУКЦИИ ПО ОТВЕТУ:
1. Сравни описание пользователя с кодом и эталоном.
2. Выставь оценку (score) от 0 до 100.
3. Напиши развернутый отзыв (feedback).
4. ОБЯЗАТЕЛЬНО заполни массивы strengths, weaknesses и suggestions (минимум по 1 пункту в каждом). Если описание идеальное, в weaknesses напиши 'Критичных замечаний нет'.

Верни ТОЛЬКО JSON:
{
    \"score\": число,
    \"feedback\": \"текст\",
    \"strengths\": [\"что пользователь указал верно\"],
    \"weaknesses\": [\"что пропущено или указано неверно\"],
    \"suggestions\": [\"как сделать описание точнее\"]
}";
    }

    /**
     * Отправить запрос к AI API
     */
    private function makeRequest($prompt)
    {
        if (empty($this->apiKey)) {
            return ['error' => 'API key is missing'];
        }

        $data = [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Ты - эксперт по анализу кода. Отвечай только валидным JSON без дополнительного текста.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.1,
            'max_tokens' => 1000 // Reduced from 256000 as it's not needed for short reviews
        ];

        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->apiKey,
            'HTTP-Referer: https://codereadai',
            'X-Title: CodeReadAI'
        ];

        $ch = curl_init($this->apiUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return ['error' => "cURL error: " . $curlError];
        }

        if ($httpCode !== 200) {
            return ['error' => "HTTP error $httpCode. Response: " . substr($response, 0, 200)];
        }

        $responseData = json_decode($response, true);
        
        if (!isset($responseData['choices'][0]['message']['content'])) {
            return ['error' => "Invalid response structure from AI provider"];
        }

        $content = $responseData['choices'][0]['message']['content'];
        
        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');
        
        if ($jsonStart === false || $jsonEnd === false) {
            return ['error' => "No JSON found in AI response. Raw: " . substr($content, 0, 100)];
        }
        
        $jsonString = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
        $result = json_decode($jsonString, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return ['error' => "JSON decode error: " . json_last_error_msg()];
        }

        if (!isset($result['score']) || !isset($result['feedback'])) {
            return ['error' => "AI response missing score or feedback"];
        }

        $result['score'] = max(0, min(100, (int)$result['score']));
        $result['strengths'] = isset($result['strengths']) ? (array)$result['strengths'] : [];
        $result['weaknesses'] = isset($result['weaknesses']) ? (array)$result['weaknesses'] : [];
        $result['suggestions'] = isset($result['suggestions']) ? (array)$result['suggestions'] : [];

        return $result;
    }
}
