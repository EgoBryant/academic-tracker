from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext

from app.core.config import settings  # Твой Pydantic-конфиг
from app.core.database import get_db
from app.models.user import User
from app.repository.user import UserRepository

# Настройка passlib для bcrypt и определение схемы OAuth2
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_password_hash(password: str) -> str:
    """Хэширование пароля с помощью bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверка совпадения сырого пароля с хэшем."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """Генерация короткоживущего Access JWT-токена (в минутах)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    
    # Зашиваем время жизни и ТИП токена в payload
    to_encode.update({
        "exp": expire,
        "type": settings.access_token_type
    })
    
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

def create_refresh_token(data: dict) -> str:
    """Генерация долгоживущего Refresh JWT-токена (в днях)."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    
    # Зашиваем время жизни и ТИП токена в payload
    to_encode.update({
        "exp": expire,
        "type": settings.refresh_token_type
    })
    
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Зависимость для проверки Access-токена и получения текущего пользователя.
    Защищает эндпоинты от неавторизованного доступа и подмены токенов.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось валидировать учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Декодируем токен с помощью ключей из настроек
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        
        # КРИТИЧЕСКАЯ ПРОВЕРКА: Проверяем, что к защищенному эндпоинту 
        # стучатся именно по ACCESS токену, а не по REFRESH
        token_type = payload.get("type")
        if token_type != settings.access_token_type:
            raise credentials_exception
            
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception
        
    # Поиск пользователя в БД через слой репозитория
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(int(user_id))
    
    if user is None:
        raise credentials_exception
    return user