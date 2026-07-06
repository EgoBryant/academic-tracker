from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.api.subjects import router as subjects_router
from app.core.database import engine  # Импортируем наш асинхронный движок


# 1. Создаем lifespan-контекст для управления жизненным циклом приложения
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Код здесь выполняется СТРОГО ПРИ СТАРТЕ сервера
    print("Запуск приложения: проверяем подключение к базе данных...")
    yield
    # Код здесь выполняется СТРОГО ПРИ ОСТАНОВКЕ сервера
    print("Остановка приложения: закрываем пул соединений с БД...")
    await engine.dispose()


# 2. Передаем lifespan в сам FastAPI
app = FastAPI(
    title="Academic Tracker API",
    description="Бэкенд-служба для отслеживания успеваемости",
    version="1.0.0",
    lifespan=lifespan  # Подключаем жизненный цикл
)

# 3. Подключаем роутер предметов
app.include_router(subjects_router)


@app.get("/")
def read_root():
    return {"message": "Привет! FastAPI успешно запущен и работает."}