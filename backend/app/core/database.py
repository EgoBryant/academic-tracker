from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# Изменяем импорт: теперь запрашиваем функцию фабрики настроек
from app.core.config import get_settings


class Base(DeclarativeBase):
    pass


# Вызываем функцию для получения объекта настроек.
# Благодаря декоратору @lru_cache чтение .env произойдет ровно один раз.
settings = get_settings()

# Инициализируем движок и фабрику сессий с использованием полученных настроек
engine = create_async_engine(
    settings.async_database_url, 
    echo = True
)
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)



async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def close_database_connection() -> None:
    await engine.dispose()