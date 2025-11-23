CodeReadAI — проект для улучшения навыка ревью кода.
В эпоху ИИ-ассистентов, способных писать огромные объёмы кода и обученные на сомнительных источниках, навыкы чтения кода, анализа и рефакторинга является критически важными. Перед программистами часто стоит задача анализа чужого кода, например при приёме на работу сотруднику необходимо ознакомиться с архитектурой проекта и освоить объём информации, внушительной частью которого является код, написанный другими людьми.

Пользователям предоставляется список задач на выбор с разными ЯП и уровнями сложности.
Задача пользователя: изучить код и максимально чётко описать механизм его действия, его смысл и указать эти данные в отчёте.
Предполагается наличие эталонного описания каждой задачи, которое будет являться образцом для сравнения с отчётом пользователя. 
Предполагается наличие промта для нейросети, который будет задавать контекст сравнения и формат ответа. 

Пример промта:
"Ты — Senior Developer, проводящий собеседование. Тебе дан код [CODE] и объяснение кандидата [USER_RESPONSE]. Твоя задача:
Проанализировать код самостоятельно и составить эталонное объяснение.
Сравнить ответ кандидата с эталоном.
Выставить оценку от 1 до 10 по критериям: Точность, Терминология, Полнота.
Дать конструктивный фидбек в формате JSON."

На начальном этапе предполагается использование API крупных нейросетей (GPT-4o, Claude 3.5 Sonnet), в дальнейшем возможен переход на локальные нейросети (Llama 3,Mixtral)

Сервис будет иметь рахличные рейтинговые системы для удержания пользователей и повышения их активности:

1) Система уровней: Junior -> Middle -> Senior -> Architect 
в зависимости от количества решённых задач/средней точности отчёта уровень будет повышаться (или понижаться)

2) Стрик активности: 
Будет выдаваться за количество дней, в течение которых было выполнено определённое условие (вход на сайт, решение 1 задачи и др.)

3) Сравнение с другими:
Ваш ответ лучше 80% пользователей.

4) Прогресс-бары для различных категорий заданий:
Прогресс-бары будут демонстрировать процент решенных задач в определенной категории 
Python [################--------] 78%
Javascript [----------------------] 0%
C++ [#######################] 100%

5) Средняя точноть отчётов:
Показатель будет зависеть от средней точности отправленных отчётов

6) Достижения:
"Hello, Code!" — выдаётся за первую успешно решённую задачу
"High Output" — выдаётся за 5 успешно решённых задач за день
"Code Routine" — выдаётся за 7 дней ежедневного решения задач
"Accuracy (90 %)" — выдаётся за среднюю точность ответов >90%




## ТЕХНИЧЕСКАЯ ЧАСТЬ ##

Предполагаемый стек:
Frontend: React + TypeScript,
@monaco-editor/react (реакт компонент для интеграции редактора кода в веб приложения)
Backend: PHP
Database: MySQL

Алгоритм работы:
React: Пользователь пишет объяснение кода и нажимает "Проверить".
PHP: Принимает данные, ищет в БД "системный промпт" для этой задачи.
PHP <-> AI API: PHP через cURL или Guzzle отправляет запрос в OpenAI/Claude API.
PHP: Получает ответ, сохраняет его в MySQL (история проверок).
React: Получает готовый JSON и рендерит его (рисует оценку, подсвечивает ошибки).

Начальная структура таблицы:
-- 1. Таблица пользователей
CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `xp_points` INT UNSIGNED DEFAULT 0 COMMENT 'Очки опыта для геймификации',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Таблица языков программирования (справочник)
CREATE TABLE `languages` (
    `id` TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Например: Python, JavaScript',
    `slug` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Для URL, например: c-sharp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Таблица задач
CREATE TABLE `tasks` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `language_id` TINYINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL COMMENT 'Краткое название задачи',
    `description` TEXT COMMENT 'Описание контекста, если нужно',
    `code_snippet` TEXT NOT NULL COMMENT 'Сам код, который нужно прочитать',
    `difficulty` ENUM('easy', 'medium', 'hard', 'expert') NOT NULL DEFAULT 'medium',
    `reference_explanation` TEXT COMMENT 'Эталонное объяснение (скрыто от юзера, для AI)',
    `is_published` BOOLEAN DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Таблица решений пользователей (Submissions)
CREATE TABLE `submissions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNSIGNED NOT NULL,
    `task_id` INT UNSIGNED NOT NULL,
    `user_text` TEXT NOT NULL COMMENT 'Ответ пользователя (объяснение кода)',
    `status` ENUM('pending', 'completed', 'error') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Таблица результатов проверки (AI Feedback)
CREATE TABLE `reviews` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `submission_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `score` TINYINT UNSIGNED NOT NULL COMMENT 'Оценка 0-100',
    `ai_feedback_json` JSON NOT NULL COMMENT 'Структурированный ответ от AI',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Добавляем индексы для ускорения поиска
CREATE INDEX idx_tasks_difficulty ON `tasks`(`difficulty`);
CREATE INDEX idx_submissions_user ON `submissions`(`user_id`);

Подробное объяснение таблиц и полей
1. users (Пользователи)
Стандартная таблица.
xp_points: Сюда мы будем плюсовать баллы после каждой успешной задачи. Это база для геймификации. Храним это прямо в профиле, чтобы не считать каждый раз сумму по всем задачам.

2. languages (Языки)
Справочник, чтобы не писать "Python" строкой в каждой задаче.
slug: Поле для красивых URL на фронтенде. Например, ссылка будет выглядеть так: mysite.com/tasks/c-sharp, где c-sharp — это slug.

3. tasks (Задачи)
Здесь хранится контент.
code_snippet: сам кусок кода. В PHP сохраняем его как текст с сохранением отступов. На React выводим через <MonacoEditor value={task.code_snippet} />.
reference_explanation: Это "секретное поле" для сравнения с ответом юзера для увеличения точности ответа нейросети

4. submissions (Отправки)
Связующее звено. Запись создается в момент, когда юзер нажал кнопку "Отправить на проверку".
status: Важное поле.
pending: Юзер отправил, скрипт PHP начал работать, но AI еще не ответил.
completed: AI ответил, результат записан.
error: Что-то упало (API недоступно).

5. reviews (Проверки / Фидбек)
Здесь хранится интеллект проекта. Я вынес это в отдельную таблицу, чтобы отделить "факт отправки" от "результата проверки".
ai_feedback_json: предполагается использование json формата для удобства парсинга параметров ответа нейросети (плюсы, минусы, оценка, баллы и тд) 
Пример того, что будет лежать в ai_feedback_json:

JSON

{
  "summary": "Ты верно определил, что это сортировка пузырьком, но упустил ошибку в индексе.",
  "criteria": {
    "logic": 8,
    "terminology": 5,
    "completeness": 6
  },
  "bugs_found": [
    "User didn't notice the memory leak in line 12"
  ],
  "refactoring_tips": "Используй arr.sort() вместо ручной реализации."
}
В базе данных MySQL это лежит в одной ячейке, но PHP (через json_decode) и JS (автоматически) превращают это в объект.
Как это работает вместе (Связи)


Пользователь (users.id = 1) выбирает Задачу (tasks.id = 5).
Он пишет текст и отправляет. Создается запись в submissions (id=100, user_id=1, task_id=5, status='pending').
PHP отправляет этот текст в AI.
AI присылает ответ.
PHP записывает результат в reviews (submission_id=100, score=85, ai_feedback_json={...}).
Обновляет submissions -> status='completed'.
React видит, что статус стал 'completed' и показывает данные из таблицы reviews.



## MVP версия ##

Код -> Объяснение пользователя -> Ответ нейронки -> Отображение оценки отчёта

Фронтенд

Регистрация/Вход: Простая форма (email, пароль).

Список Задач: Простой список (таблица) с возможностью выбрать задачу.

1) Страница Задачи:
  Отображение кода (tasks.code_snippet) с подсветкой синтаксиса (Monaco Editor).
  Большое текстовое поле для ввода объяснения (submissions.user_text).
  Кнопка "Отправить на проверку".
  Страница Результата (Review): Четкое отображение результата из JSON-структуры.

2) Контент и Данные
Пока только python
Лёгкий, средний, сложный уровни
10-15 полностью готовых задач с заполненным полем tasks.reference_explanation (для эталонного сравнения AI).

3) Бэкенд и Логика (Backend - PHP)
  API: CRUD (Create, Read, Update, Delete) для пользователей и задач.

  Core Logic: Реализация сервиса для взаимодействия с внешним AI API (OpenAI/Claude) с использованием Guzzle.

  DB Handling: Успешная запись данных в таблицы submissions и reviews (включая JSON).

  Проверка: AI должен вернуть оценку (0-100) и текстовый отчет с указанием основных ошибок.
