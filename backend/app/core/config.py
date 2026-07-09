from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # ==============================================================================
    # НАСТРОЙКИ БАЗЫ ДАННЫХ
    # Pydantic автоматически сопоставит их с верхним регистром в .env
    # ==============================================================================
    postgres_user: str
    postgres_password: str
    postgres_server: str
    postgres_port: int
    postgres_db: str
    
    # Твоя асинхронная строка подключения, которую ожидает database.py
    async_database_url: str

    # ==============================================================================
    # НАСТРОЙКИ БЕЗОПАСНОСТИ (JWT)
    # ==============================================================================
    secret_key: str
    algorithm: str = "HS256"  # значение по умолчанию, если не будет в .env
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7  # Срок жизни refresh-токена (например, 7 дней)

    # Константы для типов токенов (не нужно прописывать в .env, берутся дефолты)
    access_token_type: str = "access"
    refresh_token_type: str = "refresh"

    # ==============================================================================
    # НАСТРОЙКА ИСТОЧНИКА ДАННЫХ (Для Pydantic v2)
    # ==============================================================================
    model_config = SettingsConfigDict(
        env_file=".env",          # Указываем файл, откуда читать переменные
        env_file_encoding="utf-8",
        extra="ignore"            # Игнорировать другие системные переменные
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()