from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

# Импортируем модели базы данных
from app.models.subject import Subject
from app.models.grade import Grade
from app.schemas.subject import SubjectCreate


class SubjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_by_user(self, user_id: int) -> List[Subject]:
        query = select(Subject).where(Subject.user_id == user_id).order_by(Subject.subject_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_by_id(self, subject_id: int, user_id: int) -> Optional[Subject]:
        query = select(Subject).where(Subject.subject_id == subject_id, Subject.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_by_name(self, subject_name: str, user_id: int) -> Optional[Subject]:
        query = select(Subject).where(Subject.subject_name == subject_name, Subject.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, subject_in: SubjectCreate, user_id: int) -> Subject:
        db_subject = Subject(**subject_in.model_dump(), user_id=user_id)
        self.db.add(db_subject)

        await self.db.flush()
        return db_subject

    async def update(self, db_subject: Subject, update_data: dict) -> Subject:
        for key, value in update_data.items():
            setattr(db_subject, key, value)
        await self.db.flush()
        return db_subject

    async def delete(self, db_subject: Subject) -> None:
        """Удалить предмет из сессии (без фиксации коммита)."""
        await self.db.delete(db_subject)
        await self.db.flush()


    async def get_grade_values_by_subject(self, subject_id: int) -> List[str]:
        query = select(Grade.grade_value).where(Grade.subject_id == subject_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_average_field(self, subject_id: int, avg_value: float) -> None:
        update_query = (
            update(Subject)
            .where(Subject.subject_id == subject_id)
            .values(average_grade=avg_value)
        )
        await self.db.execute(update_query)
        await self.db.flush()


    async def commit(self) -> None:
        await self.db.commit()

    async def refresh(self, instance: any) -> None:
        await self.db.refresh(instance)