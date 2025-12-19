<?php

error_reporting(1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once('application/Answer.php');
require_once('application/Application.php');

function result($params) {
    $method = $params['method'];
    if ($method) {
        $app = new Application();
        switch ($method) {
            // user
            case 'login': return $app->login($params);
            case 'logout': return $app->logout($params);
            case 'registration': return $app->registration($params);
            case 'updateUserName': return $app->updateUserName($params);
            
            // tasks
            case 'getTasks': return $app->getTasks($params);
            case 'getTaskById': return $app->getTaskById($params);
            
            // submissions & AI
            case 'submitTask': return $app->submitTask($params);
            case 'getSubmissionStatus': return $app->getSubmissionStatus($params);
            case 'getSubmissionReview': return $app->getSubmissionReview($params);
        
            default: return ['error' => 102];
        }
    }
    return ['error' => 101];
}

// Определение параметра 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $params = array_merge($_GET, $input);
} else {
    $params = $_GET;
}
echo json_encode(Answer::response(result($params)), JSON_UNESCAPED_UNICODE);
