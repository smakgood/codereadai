# Инструкция по отправке Pull Request в codereadai

## Текущая ситуация:
- ✅ Remote `codereadai` добавлен: `https://github.com/smakgood/codereadai.git`
- ✅ Ветка `pr-codereadai` создана на основе `codereadai/master`
- ⚠️ Есть неотслеживаемые файлы в папке `client/`

## Варианты отправки PR:

### Вариант 1: У вас есть права на запись в репозиторий smakgood/codereadai

1. **Добавьте файлы в коммит:**
   ```powershell
   git add client/
   git add codereadai.sql
   git add server/
   git add *.md
   # или добавьте все нужные файлы
   ```

2. **Создайте коммит:**
   ```powershell
   git commit -m "Add client application and server backend"
   ```

3. **Отправьте ветку:**
   ```powershell
   git push codereadai pr-codereadai
   ```

4. **Создайте PR на GitHub:**
   - Перейдите на https://github.com/smakgood/codereadai
   - GitHub автоматически предложит создать PR после push
   - Или создайте вручную: https://github.com/smakgood/codereadai/compare

### Вариант 2: Нужно создать форк (если нет прав на запись)

1. **Создайте форк на GitHub:**
   - Перейдите на https://github.com/smakgood/codereadai
   - Нажмите кнопку "Fork" (справа вверху)
   - Это создаст копию репозитория в вашем аккаунте

2. **Обновите remote на ваш форк:**
   ```powershell
   git remote set-url codereadai https://github.com/ВАШ_USERNAME/codereadai.git
   ```

3. **Выполните шаги из Варианта 1** (добавить, закоммитить, отправить)

4. **Создайте PR из вашего форка в оригинальный репозиторий:**
   - Перейдите на https://github.com/smakgood/codereadai
   - Нажмите "New Pull Request"
   - Выберите ваш форк как источник

## Важно:

⚠️ **Структура проекта:** 
- В репозитории codereadai файлы находятся в корне (src/, public/)
- У вас файлы в папке `client/` (client/src/, client/public/)

**Решения:**
1. Переместить файлы из `client/` в корень перед коммитом
2. Или отправить как есть, если структура должна быть такой

## Быстрая команда для проверки прав:

Попробуйте выполнить:
```powershell
git push codereadai pr-codereadai --dry-run
```

Если получите ошибку доступа - нужен форк.

