<?php
header('Content-Type: application/json; charset=utf-8');
require_once('application/ai/AIService.php');

$ai = new AIService();
$code = 'def sum(a, b): return a + b';
$userDescription = 'Функция складывает два числа и возвращает результат';
$reference = 'Функция принимает два аргумента и возвращает их сумму';
$language = 'Python';

echo "Testing AI Service...\n";

if (!extension_loaded('curl')) {
    echo "Error: CURL extension is NOT loaded!\n";
    exit;
}

// Попытка прямого curl запроса для диагностики
echo "Diagnosing connection to OpenRouter...\n";
$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$test_res = curl_exec($ch);
$test_err = curl_error($ch);
$test_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($test_err) {
    echo "Direct connection test FAILED: $test_err\n";
} else {
    echo "Direct connection test success. HTTP Code: $test_code\n";
}

echo "\nCalling AIService->evaluateSubmission...\n";
$result = $ai->evaluateSubmission($code, $userDescription, $reference, $language);

if ($result === false) {
    echo "AI Service failed. Check error logs.\n";
} else {
    echo "AI Service success:\n";
    print_r($result);
}

