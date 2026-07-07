from fastapi import HTTPException, status
from app.repository.user import UserRepository
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserRegister):
        """Бизнес-логика регистрации нового аккаунта."""
        # Проверяем, занят ли email
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Пользователь с таким email уже зарегистрирован"
            )
        
        # Хэшируем пароль через passlib (bcrypt)
        hashed_password = get_password_hash(user_in.password)
        
        # Создаем через репозиторий
        return await self.user_repo.create(user_in, hashed_password)

    async def authenticate_user(self, credentials: UserLogin) -> dict:
        """Бизнес-логика аутентификации и генерации JWT."""
        user = await self.user_repo.get_by_email(credentials.email)
        
        # Проверяем хэш пароля
        if not user or not verify_password(credentials.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Генерируем JWT (время жизни 86400 секунд зашито внутри утилиты)
        access_token = create_access_token(data={"sub": str(user.user_id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }