-- phpMyAdmin SQL Dump
-- CodeReadAI Database Schema
-- Версия: 1.0
-- Дата создания: 2025

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `codereadai`
--

CREATE DATABASE IF NOT EXISTS `codereadai` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `codereadai`;

-- --------------------------------------------------------

--
-- 1. Таблица пользователей
--

CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT 'Хэшированный пароль (MD5 или другой алгоритм)',
    `name` VARCHAR(50) NOT NULL COMMENT 'Отображаемое имя пользователя (username в README, но используется name в коде)',
    `token` VARCHAR(255) DEFAULT NULL COMMENT 'Токен сессии для авторизации',
    `xp_points` INT UNSIGNED DEFAULT 0 COMMENT 'Очки опыта для геймификации',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 2. Таблица языков программирования (справочник)
--

CREATE TABLE `languages` (
    `id` TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Например: Python, JavaScript',
    `slug` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Для URL, например: c-sharp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 3. Таблица задач
--

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

-- --------------------------------------------------------

--
-- 4. Таблица решений пользователей (Submissions)
--

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

-- --------------------------------------------------------

--
-- 5. Таблица результатов проверки (AI Feedback)
--

CREATE TABLE `reviews` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `submission_id` BIGINT UNSIGNED NOT NULL UNIQUE,
    `score` TINYINT UNSIGNED NOT NULL COMMENT 'Оценка 0-100',
    `ai_feedback_json` JSON NOT NULL COMMENT 'Структурированный ответ от AI',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Индексы для ускорения поиска
--

CREATE INDEX idx_tasks_difficulty ON `tasks`(`difficulty`);
CREATE INDEX idx_submissions_user ON `submissions`(`user_id`);
CREATE INDEX idx_submissions_status ON `submissions`(`status`);
CREATE INDEX idx_submissions_task ON `submissions`(`task_id`);

-- --------------------------------------------------------

--
-- Вставка начальных данных
--

-- Добавляем языки программирования
INSERT INTO `languages` (`name`, `slug`) VALUES
('Python', 'python'),
('JavaScript', 'javascript'),
('TypeScript', 'typescript'),
('Java', 'java'),
('C++', 'c-plus-plus'),
('C#', 'c-sharp'),
('PHP', 'php'),
('Go', 'go'),
('Rust', 'rust');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

