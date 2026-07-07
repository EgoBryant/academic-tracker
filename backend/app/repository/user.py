from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.auth import UserRegister

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> Optional[User]:
        """Поиск пользователя по email."""
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        """Поиск пользователя по ID."""
        query = select(User).where(User.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, user_in: UserRegister, hashed_password: str) -> User:
        """Создание записи нового пользователя в БД."""
        db_user = User(
            full_name=user_in.full_name,
            email=user_in.email,
            password=hashed_password  # Сохраняем уже готовый хэш
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user