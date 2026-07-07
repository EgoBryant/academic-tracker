from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Subject
from app.schemas.subject import SubjectCreate

class SubjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_user(self, user_id: int) -> List[Subject]:
        """Получить все предметы конкретного пользователя."""
        query = select(Subject).where(Subject.user_id == user_id).order_by(Subject.subject_id)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, subject_id: int, user_id: int) -> Optional[Subject]:
        """Получить конкретный предмет пользователя по ID."""
        query = select(Subject).where(Subject.subject_id == subject_id, Subject.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_name(self, subject_name: str, user_id: int) -> Optional[Subject]:
        """Проверить существование предмета с таким именем у конкретного пользователя."""
        query = select(Subject).where(Subject.subject_name == subject_name, Subject.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, subject_in: SubjectCreate, user_id: int) -> Subject:
        """Создать предмет с привязкой к текущему пользователю."""
        db_subject = Subject(**subject_in.model_dump(), user_id=user_id)
        self.db.add(db_subject)
        await self.db.commit()
        await self.db.refresh(db_subject)
        return db_subject

    async def update(self, db_subject: Subject, update_data: dict) -> Subject:
        """Обновить поля предмета."""
        for key, value in update_data.items():
            setattr(db_subject, key, value)
        await self.db.commit()
        await self.db.refresh(db_subject)
        return db_subject

    async def delete(self, db_subject: Subject) -> None:
        """Удалить предмет."""
        await self.db.delete(db_subject)
        await self.db.commit()