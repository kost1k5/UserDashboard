# Deployment Guide - User Management System

## ✅ Checklist перед деплоем

### 1. Все требования ТЗ выполнены:
- ✅ UNIQUE INDEX на email в БД
- ✅ Обработка ошибки 23505 (дублирование email)
- ✅ Таблица с checkboxes и toolbar
- ✅ Сортировка по last_login_time DESC NULLS LAST
- ✅ Multiple selection (включая select all)
- ✅ Проверка пользователя перед каждым запросом
- ✅ Email verification (асинхронная отправка)
- ✅ Bootstrap CSS framework
- ✅ NO BROWSER ALERTS (используются toast notifications)
- ✅ NO BUTTONS IN ROWS (только toolbar)
- ✅ Блокировка/удаление пользователей (включая себя)
- ✅ Toast notifications для всех операций

---

## 🚀 Deployment на Vercel (Рекомендуется)

### Шаг 1: Подготовка репозитория

1. Создайте репозиторий на GitHub (публичный)
2. Добавьте файлы в git:
```bash
cd task4
git init
git add .
git commit -m "Initial commit: User Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/user-management-system.git
git push -u origin main
```

### Шаг 2: База данных PostgreSQL

**Вариант A: Vercel Postgres (Простой)**
1. Зайдите на [vercel.com](https://vercel.com)
2. Storage → Create Database → Postgres
3. Скопируйте connection string

**Вариант B: Supabase (Бесплатный)**
1. Зайдите на [supabase.com](https://supabase.com)
2. New Project → создайте проект
3. Settings → Database → Connection String (Direct)
4. Скопируйте строку подключения

**Вариант C: Neon.tech (Бесплатный)**
1. Зайдите на [neon.tech](https://neon.tech)
2. Создайте проект
3. Скопируйте connection string

### Шаг 3: Выполните SQL миграцию

Подключитесь к БД и выполните:
```sql
-- Из файла migrations/01_create_users_table.sql
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'unverified',
    last_login_time TIMESTAMP DEFAULT NULL,
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_token VARCHAR(255) DEFAULT NULL
);

CREATE UNIQUE INDEX idx_users_email_unique ON Users(email);
CREATE INDEX idx_verification_token ON Users(verification_token);
CREATE INDEX idx_last_login_time ON Users(last_login_time DESC NULLS LAST);
```

### Шаг 4: Настройка Email (Gmail)

1. Включите 2FA в Google аккаунте
2. Создайте App Password:
   - Google Account → Security → 2-Step Verification
   - App passwords → Select app: Mail → Generate
3. Скопируйте 16-значный пароль

### Шаг 5: Deploy на Vercel

1. Зайдите на [vercel.com](https://vercel.com)
2. Import Git Repository → выберите ваш репозиторий
3. Framework Preset: Next.js
4. Root Directory: `task4`
5. Environment Variables (добавьте):
   ```
   DB_USER=your_db_user
   DB_HOST=your_db_host
   DB_NAME=your_db_name
   DB_PASS=your_db_password
   DB_PORT=5432
   JWT_SECRET=your_super_secret_key_at_least_32_characters_long_random_string
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_char_app_password
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
6. Deploy

---

## 🎥 Video для отправки

Запишите видео с демонстрацией:

1. **Регистрация** нового пользователя
2. **Email confirmation** (покажите письмо, кликните ссылку)
3. **Login** с подтвержденным аккаунтом
4. **Dashboard** с таблицей пользователей
5. **Выбор пользователя** (не текущего)
6. **Block** пользователя (status обновляется)
7. **Unblock** пользователя
8. **Select All** (включая текущего)
9. **Block All** → автоматический редирект на login
10. **ДЕМОНСТРАЦИЯ UNIQUE INDEX** в БД:
    - Откройте SQL клиент (pgAdmin, DBeaver, Supabase SQL Editor)
    - Выполните: `\d Users` или `SELECT * FROM pg_indexes WHERE tablename = 'users';`
    - Покажите индекс `idx_users_email_unique`
11. **ДЕМОНСТРАЦИЯ ОБРАБОТКИ ОШИБКИ**:
    - Покажите код в [register/route.js](app/api/register/route.js) строка 43-46:
    ```javascript
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Этот email уже зарегистрирован' },
        { status: 409 }
      );
    }
    ```
    - Попробуйте зарегистрировать дублирующийся email → покажите сообщение об ошибке

---

## 📧 Отправка решения

Отправьте на **p.lebedev@itransition.com**:

```
Full name: Ваше имя

Link to source code: https://github.com/YOUR_USERNAME/user-management-system

Link to deployed project: https://your-app.vercel.app

Video link: [ссылка на Google Drive / YouTube]

---

Tech Stack:
- Next.js 14 (App Router)
- React
- PostgreSQL
- Bootstrap 5
- JWT Authentication
- Nodemailer (Email)
```

---

## 🔧 Альтернативные хостинги

### Render.com
- Поддерживает PostgreSQL
- Бесплатный tier
- Простой деплой из GitHub

### Railway.app
- PostgreSQL из коробки
- $5 в месяц бесплатно
- Автоматический деплой

### Netlify
- Требует serverless functions
- Сложнее для Next.js с БД

---

## ⚠️ Важные проверки перед отправкой

1. ✅ UNIQUE INDEX создан в БД
2. ✅ Ошибка 23505 обрабатывается в коде
3. ✅ Email отправка работает
4. ✅ Все кнопки работают (Block, Unblock, Delete, Delete Unverified)
5. ✅ Self-deletion перенаправляет на login
6. ✅ Блокированный пользователь не может войти
7. ✅ Нет browser alerts (только toast)
8. ✅ Responsive дизайн (работает на мобильном)
9. ✅ Видео содержит демонстрацию UNIQUE INDEX
10. ✅ Видео показывает обработку ошибки 23505 в коде

---

## 🆘 Troubleshooting

**Проблема: Email не отправляются**
- Проверьте EMAIL_USER и EMAIL_PASS в .env
- Убедитесь, что используете App Password (не обычный пароль)
- Проверьте, что 2FA включена в Google

**Проблема: Cannot connect to database**
- Проверьте connection string
- Убедитесь, что БД доступна извне
- Проверьте firewall правила

**Проблема: 401 Unauthorized**
- Очистите cookies и localStorage
- Войдите заново
- Проверьте JWT_SECRET в env

**Проблема: Hydration errors**
- Уже исправлено через suppressHydrationWarning
- Если появляется - отключите расширения браузера

---

**Дедлайн: 04.02.2026** (ЗАВТРА!)

Удачи! 🚀
