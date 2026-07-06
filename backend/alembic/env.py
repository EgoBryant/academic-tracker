import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 1. Добавляем текущую рабочую директорию в пути Python.
# Теперь Alembic сможет спокойно импортировать пакет "app"
sys.path.insert(0, os.getcwd())

# 2. Импортируем твой синглтон настроек и базовый класс моделей
from app.core.config import settings
from app.models import Base  # Импорт соберет все модели из твоего app/models/__init__.py

# Это объект конфигурации Alembic
config = context.config

# 3. Передаем асинхронный URL из твоего .env прямо в конфигурацию Alembic
config.set_main_option("sqlalchemy.url", settings.async_database_url)

# Настройка логирования (берется из alembic.ini)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Указываем метаданные наших моделей для autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Запуск миграций в 'offline' режиме (генерация SQL-скриптов без подключения к БД)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Запуск миграций в 'online' режиме (с реальным подключением к PostgreSQL)."""
    print(f"\n---> ТЕКУЩИЙ URL В ALEMBIC: {config.get_main_option('sqlalchemy.url')}\n")
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section) or {},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())