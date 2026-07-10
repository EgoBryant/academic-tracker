from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.assignment import Assignment
from app.models.subject import Subject

class AssignmentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, assignment: Assignment) -> Assignment:
        self.db.add(assignment)
        await self.db.flush()
        return assignment

    async def get_by_id(self, assignment_id: int) -> Assignment | None:
        query = select(Assignment).where(Assignment.assignment_id == assignment_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_all_by_user(self, user_id: int):
        query = (
            select(Assignment)
            .join(Subject, Subject.subject_id == Assignment.subject_id)
            .where(Subject.user_id == user_id)
        )
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def delete(self, assignment: Assignment) -> None:
        await self.db.delete(assignment)
        await self.db.flush()
    
    def add(self, instance: any) -> None:
        self.db.add(instance)

    async def flush(self) -> None:
        await self.db.flush()

    async def commit(self) -> None:
        await self.db.commit()
    
    async def refresh(self, instance: any) -> None:
        await self.db.refresh(instance)