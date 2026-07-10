from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.subject import Subject
from app.models.grade import Grade
from app.models.assignment import Assignment

class DataTransferRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_subjects_by_user(self, user_id: int) -> List[Subject]:
        query = select(Subject).where(Subject.user_id == user_id)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_grades_by_subject_ids(self, subject_ids: List[int]) -> List[Grade]:
        if not subject_ids:
            return []
        query = select(Grade).where(Grade.subject_id.in_(subject_ids))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_assignments_by_subject_ids(self, subject_ids: List[int]) -> List[Assignment]:
        if not subject_ids:
            return []
        query = select(Assignment).where(Assignment.subject_id.in_(subject_ids))
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_subject_by_name(self, user_id: int, subject_name: str) -> Optional[Subject]:
        query = select(Subject).where(Subject.user_id == user_id, Subject.subject_name == subject_name)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_grade_by_attributes(self, subject_id: int, grade_value: str, description: str) -> Optional[Grade]:
        query = select(Grade).where(
            Grade.subject_id == subject_id,
            Grade.grade_value == grade_value,
            Grade.description == description
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_assignment_by_title(self, subject_id: int, title: str) -> Optional[Assignment]:
        query = select(Assignment).where(
            Assignment.subject_id == subject_id,
            Assignment.title == title
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    def add(self, instance: any) -> None:
        self.db.add(instance)

    async def flush(self) -> None:
        await self.db.flush()

    async def commit(self) -> None:
        await self.db.commit()
    