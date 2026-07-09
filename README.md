# Academic Tracker

Веб-приложение для учета учебных предметов, оценок и заданий. Проект помогает студенту хранить информацию об учебном процессе в одном месте: вести список дисциплин, добавлять оценки, отслеживать средний балл и контролировать дедлайны в календаре.

## О проекте

Academic Tracker разработан как клиент-серверное приложение:

- **Frontend** отвечает за пользовательский интерфейс, маршрутизацию страниц и отправку запросов к API.
- **Backend** предоставляет REST API, авторизацию, бизнес-логику и работу с базой данных.
- **PostgreSQL** используется для хранения пользователей, предметов, оценок и заданий.
- **Alembic** используется для управления миграциями базы данных.

## Основные возможности

- регистрация и авторизация пользователей;
- хранение JWT-токена на клиенте и отправка авторизованных запросов;
- создание, просмотр, редактирование и удаление учебных предметов;
- добавление, редактирование и удаление оценок по предметам;
- автоматический пересчет среднего балла по предмету;
- создание, редактирование и удаление заданий с дедлайнами;
- календарь заданий;
- экспорт данных в XLSX;
- экспорт данных в ZIP-архив с CSV-файлами;
- импорт данных из XLSX или ZIP/CSV;
- валидация пользовательского ввода;
- обработка ошибок на frontend и backend.

## Технологии

### Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Oxlint

### Backend

- Python
- FastAPI
- SQLAlchemy AsyncIO
- Alembic
- PostgreSQL
- Pydantic
- JWT
- Pandas
- OpenPyXL

## Структура проекта

```text
academic-tracker/
+-- backend/
|   +-- alembic/
|   |   +-- versions/
|   +-- app/
|   |   +-- api/
|   |   +-- core/
|   |   +-- models/
|   |   +-- repository/
|   |   +-- schemas/
|   |   +-- service/
|   +-- alembic.ini
|   +-- requirments.txt
+-- frontend/
|   +-- public/
|   +-- src/
|   |   +-- api/
|   |   +-- assets/
|   |   +-- components/
|   |   +-- data/
|   |   +-- pages/
|   |   +-- styles/
|   |   +-- types/
|   +-- package.json
|   +-- vite.config.ts
+-- .gitignore
+-- README.md
```

## Требования

Перед запуском нужно установить:

- Node.js и npm;
- Python 3.11+;
- PostgreSQL;
- Git.

## Настройка backend

Перейдите в папку backend:

```bash
cd backend
```

Создайте и активируйте виртуальное окружение:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Linux/macOS:

```bash
source .venv/bin/activate
```

Установите зависимости:

```bash
pip install -r requirments.txt
```

Создайте файл `.env` в папке `backend` и заполните переменные окружения:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=academic_tracker
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:your_password@localhost:5432/academic_tracker
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

Примените миграции:

```bash
alembic upgrade head
```

Запустите backend:

```bash
uvicorn app.main:app --reload
```

После запуска API будет доступен по адресу:

```text
http://localhost:8000
```

Документация FastAPI:

```text
http://localhost:8000/docs
```

## Настройка frontend

Перейдите в папку frontend:

```bash
cd frontend
```

Установите зависимости:

```bash
npm install
```

При необходимости создайте или обновите файл `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_DATA_API_URL=http://localhost:8000
```

Запустите frontend:

```bash
npm run dev
```

По умолчанию Vite откроет приложение на локальном адресе вида:

```text
http://localhost:5173
```

## Скрипты frontend

```bash
npm run dev
```

Запуск проекта в режиме разработки.

```bash
npm run build
```

Проверка TypeScript и сборка production-версии.

```bash
npm run lint
```

Проверка кода через Oxlint.

```bash
npm run preview
```

Локальный просмотр production-сборки.

## База данных

В проекте используется PostgreSQL.

Основные таблицы:

- `users` - пользователи;
- `subjects` - учебные предметы;
- `grades` - оценки;
- `assignments` - задания и дедлайны.

Связи между таблицами реализованы через внешние ключи. Оценки и задания связаны с предметами, а предметы принадлежат конкретному пользователю.

## Основные API-маршруты

Актуальный список подключенных маршрутов можно посмотреть в Swagger UI после запуска backend: `http://localhost:8000/docs`.

### Авторизация

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Регистрация пользователя |
| `POST` | `/api/auth/login` | Авторизация и получение токена |

### Предметы

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `GET` | `/api/subjects/` | Получить список предметов пользователя |
| `POST` | `/api/subjects/` | Создать предмет |
| `PUT` | `/api/subjects/{subject_id}` | Обновить предмет |
| `DELETE` | `/api/subjects/{subject_id}` | Удалить предмет |

### Оценки

Маршруты оценок реализованы в `backend/app/api/grade.py`. Если они не отображаются в Swagger UI, нужно подключить этот роутер в `backend/app/main.py`.

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `GET` | `/api/subjects/{subject_id}/grades` | Получить оценки по предмету |
| `POST` | `/api/subjects/{subject_id}/grades` | Добавить оценку |
| `PUT` | `/api/grades/{grade_id}` | Обновить оценку |
| `DELETE` | `/api/grades/{grade_id}` | Удалить оценку |

### Задания

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `GET` | `/api/assignments/` | Получить задания пользователя |
| `POST` | `/api/assignments/` | Создать задание |
| `PUT` | `/api/assignments/{assignment_id}` | Обновить задание |
| `DELETE` | `/api/assignments/{assignment_id}` | Удалить задание |

### Импорт и экспорт

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `GET` | `/data/export/xlsx` | Экспорт данных в XLSX |
| `GET` | `/data/export/csv` | Экспорт данных в ZIP-архив с CSV |
| `POST` | `/data/import` | Импорт данных из файла |

## Страницы frontend

| Маршрут | Страница |
| --- | --- |
| `/login` | Авторизация |
| `/register` | Регистрация |
| `/subjects` | Список предметов |
| `/subjects/:id` | Детальная страница предмета с оценками |
| `/calendar` | Календарь заданий |

## Пример полного запуска

В первом терминале:

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Во втором терминале:

```bash
cd frontend
npm run dev
```

## Команда проекта

| Участник | Роль |
| --- | --- |
| Team Lead | Координация разработки, организация работы команды, документация, подготовка защиты |
| Егор | Frontend-разработка |
| Радомир | Backend-разработка |
| Ваня | Тестирование и исправление ошибок |
| Тигран | Помощь в разработке и реализации функционала |

