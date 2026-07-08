from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Импортируем роутеры из слоя API
from app.api.auth import router as auth_router
from app.api.subjects import router as subjects_router
from app.api.grade import router as grades_router
from app.api.assignments import router as assignments_router
from app.api.export_import import router as export_import_router
# Инициализируем приложение FastAPI
app = FastAPI(
    title="Student Dashboard API",
    description="Бэкенд-система с JWT-авторизацией для учета предметов, заданий и оценок",
    version="1.0.0",
)

# Настройка CORS (Cross-Origin Resource Sharing)
# Необходима для того, чтобы ваш React-фронтенд или мобильное приложение могли слать запросы к API
origins = [
    "http://localhost:3000",  # Локальный порт React
    "http://localhost:5173",  # Локальный порт Vite / React
    "*",                      # На этапе разработки можно временно разрешить все источники
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP-методы (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Разрешаем все заголовки (включая Authorization для JWT)
)

# Подключаем роутеры
# Так как префиксы (/v1/auth и /v1/subjects) мы уже жестко зашили внутри самих файлов роутеров,
# здесь мы просто регистрируем модули в приложении.
app.include_router(auth_router)
app.include_router(subjects_router)
app.include_router(assignments_router)
# Там, где подключаются остальные роутеры (auth, subjects):
app.include_router(grades_router)
app.include_router(export_import_router)
# Корневой эндпоинт для быстрой проверки работоспособности (Health Check)
@app.get("/", tags=["Root"])
async def root():
    return {
        "status": "healthy",
        "message": "Бэкенд успешно запущен. Документация доступна по адресу /docs"
    }