<?php
class Answer
{
    static $CODES = array(
        '101' => 'Param method not setted',
        '102' => 'Method not found',
        '242' => 'Params not set fully',
        '705' => 'Пользователь не найден',
        '1001' => 'Is it unique login?',
        '1002' => 'Неправильный логин или пароль',
        '1003' => 'Неудачная попытка выхода',
        '1004' => 'Неудачная попытка регистрации',
        '1005' => 'Пользователь не существует',
        '1007' => 'Пользователь с этим email уже зарегистрирован',
        '1009' => 'Ошибка обновления имени пользователя',
        '1010' => 'Имя уже занято',
        '404' => 'not found',
        '9000' => 'unknown error',
        '9001' => 'Task configuration error',
        '9002' => 'Database error',
        '9003' => 'AI Service error',
        '9004' => 'Review saving error'
    );

    static function response($data)
    {
        // Проверяем, что $data не null и не false
        if ($data !== null && $data !== false) {
            // Если это массив с ключом error, возвращаем ошибку
            if (is_array($data) && array_key_exists('error', $data)) {
                $code = $data['error'];
                $text = isset($data['text']) ? $data['text'] : (isset(self::$CODES[$code]) ? self::$CODES[$code] : 'Unknown error');
                return [
                    'result' => 'error',
                    'error' => [
                        'code' => $code,
                        'text' => $text
                    ]
                ];
            }
            // Иначе возвращаем успешный ответ (даже если $data - пустой массив)
            return [
                'result' => 'ok',
                'data' => $data
            ];
        }
        // Если $data === null или false, возвращаем ошибку
        $code = 9000;
        return [
            'result' => 'error',
            'error' => [
                'code' => $code,
                'text' => self::$CODES[$code]
            ]
        ];
    }
}