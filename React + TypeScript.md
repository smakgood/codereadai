# 🚀 Полный гайд: React + PHP + MySQL на Ubuntu 24.04

## 📦 Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

***

## 🐘 Установка PHP 8.3 и расширений

```bash
sudo apt install php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl -y
```

### Проверка PHP-FPM

```bash
sudo systemctl status php8.3-fpm
```

Должен быть статус: **active (running)** ✅

***

## 🌐 Установка и настройка Nginx

### Установка Nginx

```bash
sudo apt install nginx -y
```

### Создание конфига сайта

```bash
sudo nano /etc/nginx/sites-available/codereadai
```

**Вставьте этот конфиг:**

```nginx
server {
    listen 80;
    server_name owerlord.ru www.owerlord.ru;

    access_log /var/log/nginx/codereadai_80_access.log;
    error_log /var/log/nginx/codereadai_80_error.log;

    root /var/www/codereadai/public;
    index index.html;

    location ~ /\. {
        deny all;
    }

    location /api/ {
        alias /var/www/codereadai/api/;
        index index.php;
        
        try_files $uri $uri/ @api;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME /var/www/codereadai/api/index.php;
            include fastcgi_params;
            fastcgi_param QUERY_STRING $args;
        }
    }
    
    location @api {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME /var/www/codereadai/api/index.php;
        include fastcgi_params;
        fastcgi_param QUERY_STRING $args;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

***

### Активация конфига

```bash
# Создаём симлинк в sites-enabled
sudo ln -s /etc/nginx/sites-available/codereadai /etc/nginx/sites-enabled/
```

**Важно!** Симлинк нужен, чтобы Nginx подхватил конфиг — файлы в `sites-available` хранятся как шаблоны, а активные конфиги читаются из `sites-enabled`.[1][2]

***

### Проверка пути к PHP-FPM сокету

```bash
ls -la /var/run/php/
```

Должен быть файл:
```
php8.3-fpm.sock
```

Если его нет, проверьте `/run/php/`:

```bash
ls -la /run/php/
```

И в конфиге nginx замените `/var/run/php/` на `/run/php/` если требуется.[3][4]

***

### Валидация и перезапуск Nginx

```bash
# Проверяем синтаксис конфига
sudo nginx -t

# Перезапускаем Nginx
sudo systemctl restart nginx
```

Должно показать:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

***

## 📁 Создание структуры директорий

```bash
# Переходим в директорию проектов
cd /var/www/

# Создаём структуру
sudo mkdir -p codereadai/api
sudo mkdir -p codereadai/public
```

**Правильная структура:**
```
/var/www/codereadai/
├── api/          ← PHP бэкенд
└── public/       ← React билд (index.html + assets)
```

***

### Права доступа на файлы

```bash
# Владелец: www-data (пользователь веб-сервера)
sudo chown -R www-data:www-data /var/www/codereadai/

# Права: 755 (чтение/выполнение для всех, запись только владельцу)
sudo chmod -R 755 /var/www/codereadai/
```

Это критично для работы PHP-FPM и Nginx — без правильных прав будут ошибки **403 Forbidden** или **502 Bad Gateway**

***

## 🗄️ Установка и настройка MySQL

### Установка MySQL

```bash
sudo apt install mysql-server -y
```

### Безопасная настройка MySQL

```bash
sudo mysql_secure_installation
```

**Ответы:**
- VALIDATE PASSWORD component? → `n` (или `y` если нужна политика паролей)
- New password → **придумай надёжный пароль для root**
- Remove anonymous users? → `y`
- **Disallow root login remotely? → `n`** ← Изменено для удалённого доступа
- Remove test database? → `y`
- Reload privilege tables? → `y`

***

### Создание базы данных

```bash
# Вход в MySQL
sudo mysql -u root -p
```

**Выполните SQL команды:**

```sql
-- Показать существующие базы
SHOW DATABASES;

-- Создать базу с кодировкой UTF-8
CREATE DATABASE codereadai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создать пользователя для ЛОКАЛЬНОГО доступа
CREATE USER 'codereadai_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';

-- Создать пользователя для УДАЛЁННОГО доступа (DBeaver)
CREATE USER 'codereadai_user'@'%' IDENTIFIED BY 'YourSecurePassword123!';

-- Выдать права на базу (локально)
GRANT ALL PRIVILEGES ON codereadai.* TO 'codereadai_user'@'localhost';

-- Выдать права на базу (удалённо)
GRANT ALL PRIVILEGES ON codereadai.* TO 'codereadai_user'@'%';

-- Применить изменения
FLUSH PRIVILEGES;

-- Проверяем созданных пользователей
SELECT User, Host FROM mysql.user WHERE User = 'codereadai_user';

-- Выход
EXIT;
```

**⚠️ Важно!** 
- `'codereadai_user'@'localhost'` — для подключения с сервера (PHP).
- `'codereadai_user'@'%'` — для подключения из любого места (DBeaver).
- `%` означает "любой IP-адрес". Для большей безопасности можно указать конкретный IP: `'codereadai_user'@'123.45.67.89'`.[6]

***

## 🌍 Настройка MySQL для удалённого доступа (DBeaver)

### 1. Редактируем конфиг MySQL

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Найди строку:**
```ini
bind-address = 127.0.0.1
```

**Замени на:**
```ini
bind-address = 0.0.0.0
```

Это позволит MySQL принимать подключения со всех IP-адресов.[8][9][10]

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

***

### 2. Перезапускаем MySQL

```bash
sudo systemctl restart mysql
```

***

### 3. Проверяем что MySQL слушает на всех интерфейсах

```bash
sudo netstat -tuln | grep 3306
```

Должно быть:
```
tcp  0  0  0.0.0.0:3306  0.0.0.0:*  LISTEN
```

Если команда `netstat` не найдена:
```bash
sudo apt install net-tools -y
```

***

### 4. Открываем порт 3306 в файрволе (если используется UFW)

```bash
# Проверяем статус UFW
sudo ufw status

# Если активен — открываем порт MySQL
sudo ufw allow 3306/tcp

# Перезагружаем правила
sudo ufw reload
```

***

## 🔌 Подключение через DBeaver

### Вариант 1: Прямое подключение (небезопасный)

**В DBeaver:**

1. **Database** → **New Database Connection** → **MySQL**
2. **Настройки подключения:**
   - **Host:** `owerlord.ru` (или IP сервера)
   - **Port:** `3306`
   - **Database:** `codereadai`
   - **Username:** `codereadai_user`
   - **Password:** `YourSecurePassword123!`
3. **Test Connection** → **OK**

[11][12]

***

### Вариант 2: Через SSH туннель (рекомендуется) 🔒

**Более безопасный способ** — подключение через SSH.[13][14][12]

**В DBeaver:**

1. **Database** → **New Database Connection** → **MySQL**
2. **Main:**
   - **Host:** `localhost` ← важно!
   - **Port:** `3306`
   - **Database:** `codereadai`
   - **Username:** `codereadai_user`
   - **Password:** `YourSecurePassword123!`

3. **SSH вкладка:**
   - ✅ **Use SSH Tunnel**
   - **Host/IP:** `owerlord.ru` (публичный IP сервера)
   - **Port:** `22`
   - **User Name:** `root` (или твой SSH пользователь)
   - **Authentication Method:** 
     - **Password** (если по паролю)
     - **Public Key** (если по SSH ключу)

4. **Test Connection** → **OK**

**При SSH туннеле:**
- Не нужно открывать порт 3306 в интернет
- Весь трафик шифруется через SSH
- Можно оставить `bind-address = 127.0.0.1` для большей безопасности

[14][13]

***

## 📥 Импорт дампа базы данных

### Способ 1: Из командной строки (рекомендуется)

```bash
mysql -u codereadai_user -p codereadai < /var/www/github/codereadai/codereadai.sql
```

**Введи пароль:** `YourSecurePassword123!`[15][16][17]

***

### Способ 2: Из MySQL консоли

```bash
# Вход в MySQL
mysql -u codereadai_user -p

# В консоли MySQL:
USE codereadai;
SOURCE /var/www/github/codereadai/codereadai.sql;
EXIT;
```

***

### Способ 3: Через DBeaver (GUI)

1. Подключись к базе через DBeaver
2. ПКМ на базе `codereadai` → **Tools** → **Restore database...**
3. Выбери файл `.sql` дампа
4. **Start**

***

### Проверка импорта

```bash
# Вход в базу
mysql -u codereadai_user -p codereadai

# Показать таблицы
SHOW TABLES;

# Показать структуру таблицы (пример)
DESCRIBE users;

# Выход
EXIT;
```

***

## ✅ Финальная проверка

### 1. Проверка сервисов

```bash
# Nginx
sudo systemctl status nginx

# PHP-FPM
sudo systemctl status php8.3-fpm

# MySQL
sudo systemctl status mysql
```

Все должны быть **active (running)** ✅

***

### 2. Проверка конфига Nginx

```bash
sudo nginx -t
```

Должно быть:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

***

### 3. Проверка прав доступа

```bash
ls -la /var/www/codereadai/
```

Должно быть:
```
drwxr-xr-x  www-data www-data api/
drwxr-xr-x  www-data www-data public/
```

***

### 4. Проверка MySQL пользователей

```bash
sudo mysql -u root -p
```

```sql
-- Смотрим пользователей
SELECT User, Host FROM mysql.user WHERE User = 'codereadai_user';

-- Проверяем права
SHOW GRANTS FOR 'codereadai_user'@'localhost';
SHOW GRANTS FOR 'codereadai_user'@'%';

EXIT;
```

Должно быть:
```
+------------------+-----------+
| User             | Host      |
+------------------+-----------+
| codereadai_user  | %         |
| codereadai_user  | localhost |
+------------------+-----------+
```

***

## 📝 Что дальше?

Теперь можно:

1. **Загрузить PHP API** в `/var/www/codereadai/api/`
2. **Собрать React** (`npm run build`) и загрузить в `/var/www/codereadai/public/`
3. **Настроить DB.php** с параметрами:
   - host: `localhost`
   - database: `codereadai`
   - username: `codereadai_user`
   - password: `YourSecurePassword123!`

4. **Проверить работу:**
   - Фронт: `http://owerlord.ru/`
   - API: `http://owerlord.ru/api/?method=test`
   - DBeaver: подключение через SSH или прямое

***

## 🔒 Бонус: Настройка HTTPS (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d owerlord.ru -d www.owerlord.ru

# Автопродление (проверка)
sudo certbot renew --dry-run
```

После этого Nginx автоматически перенастроится на HTTPS!

***

## 🔐 Рекомендации по безопасности

### Для production сервера:

1. **Используй SSH туннель в DBeaver** вместо прямого доступа к MySQL[13][14]
2. **Ограничь доступ по IP:**
   ```sql
   CREATE USER 'codereadai_user'@'123.45.67.89' IDENTIFIED BY 'pass';
   ```
   Вместо `%`[6]

3. **Закрой порт 3306 в UFW** если используешь SSH туннель:
   ```bash
   sudo ufw deny 3306/tcp
   ```

4. **Используй сильные пароли** для всех пользователей БД

***

## 📊 Сравнение методов подключения DBeaver

| Метод | Безопасность | Сложность | Требует открытого порта 3306 |
|-------|-------------|-----------|------------------------------|
| Прямое подключение | ⚠️ Низкая | Простая | Да |
| SSH Туннель | ✅ Высокая | Средняя | Нет |

**Рекомендуется использовать SSH туннель для production!**[12][14][13]

