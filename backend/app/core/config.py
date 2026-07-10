from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    postgres_user: str
    postgres_password: str
    postgres_server: str
    postgres_port: int
    postgres_db: str
    
    async_database_url: str
    secret_key: str
    algorithm: str = "HS256"  
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7  


    access_token_type: str = "access"
    refresh_token_type: str = "refresh"
    model_config = SettingsConfigDict(
        env_file=".env",          
        env_file_encoding="utf-8",
        extra="ignore"            
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()