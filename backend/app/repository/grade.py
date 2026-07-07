from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, cast, Float
from app.models.grade import Grade
from app.models.subject import Subject
from typing import List, Optional

class GradeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, grade_id: int) -> Optional[Grade]:
        result = await self.db.execute(select(Grade).where(Grade.grade_id == grade_id))
        return result.scalar_one_or_none()

    async def get_by_subject_id(self, subject_id: int) -> List[Grade]:
        result = await self.db.execute(select(Grade).where(Grade.subject_id == subject_id))
        return list(result.scalars().all())

    async def create(self, grade: Grade) -> Grade:
        self.db.add(grade)
        await self.db.flush()
        return grade

    async def delete(self, grade: Grade) -> None:
        await self.db.delete(grade)
        await self.db.flush()

    async def calculate_and_update_average(self, subject_id: int) -> float:
        # Регулярное выражение отбирает только строки, являющиеся целыми или дробными числами
        numeric_filter = Grade.grade_value.op('~')('^[0-9]+(\\.[0-9]+)?$')
        
        query = (
            select(func.avg(cast(Grade.grade_value, Float)))
            .where(Grade.subject_id == subject_id, numeric_filter)
        )
        
        result = await self.db.execute(query)
        avg_grade = result.scalar()
        
        new_average = round(avg_grade, 2) if avg_grade is not None else 0.0
        
        await self.db.execute(
            update(Subject)
            .where(Subject.subject_id == subject_id)
            .values(average_grade=new_average)
        )
        await self.db.flush()
        return new_average