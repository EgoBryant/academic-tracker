from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.grade import Grade
from app.schemas.grade import GradeCreate, GradeUpdate
from app.repository.grade import GradeRepository

class GradeService:
    def __init__(self, db: AsyncSession):
        self.repo = GradeRepository(db)

    async def _verify_subject_owner(self, subject_id: int, user_id: int):
        """Вспомогательный метод безопасности"""
        from app.models.subject import Subject
        query = select(Subject).where(Subject.subject_id == subject_id, Subject.user_id == user_id)
        result = await self.repo.db.execute(query) 
        subject = result.scalar_one_or_none()
        
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Предмет не найден или нет прав доступа."
            )
        return subject

    async def get_grades(self, subject_id: int, user_id: int):
        await self._verify_subject_owner(subject_id, user_id)
        return await self.repo.get_by_subject_id(subject_id)

    async def create_grade(self, subject_id: int, grade_in: GradeCreate, user_id: int):
        await self._verify_subject_owner(subject_id, user_id)
        
        new_grade = Grade(
            subject_id=subject_id,
            grade_value=grade_in.grade_value,
            description=grade_in.description,
            graded_at=grade_in.graded_at
        )
        
        await self.repo.create(new_grade)
        await self.repo.calculate_and_update_average(subject_id)
        
        # Вызываем методы транзакции НАПРЯМУЮ через репозиторий
        await self.repo.commit()
        await self.repo.refresh(new_grade)
        
        return new_grade

    async def update_grade(self, grade_id: int, grade_in: GradeUpdate, user_id: int):
        grade = await self.repo.get_by_id(grade_id)
        if not grade:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оценка не найдена.")
            
        await self._verify_subject_owner(grade.subject_id, user_id)
        
        if grade_in.grade_value is not None:
            grade.grade_value = grade_in.grade_value
        if grade_in.description is not None:
            grade.description = grade_in.description
        if grade_in.graded_at is not None:
            grade.graded_at = grade_in.graded_at
            
        await self.repo.calculate_and_update_average(grade.subject_id)
        
        # Вызываем коммит через репозиторий
        await self.repo.commit()
        await self.repo.refresh(grade)
        
        return grade

    async def delete_grade(self, grade_id: int, user_id: int):
        grade = await self.repo.get_by_id(grade_id)
        if not grade:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оценка не найдена.")
            
        await self._verify_subject_owner(grade.subject_id, user_id)
        subject_id = grade.subject_id

        await self.repo.delete(grade)
        await self.repo.calculate_and_update_average(subject_id)
        
        # Закрываем транзакцию через репозиторий
        await self.repo.commit()
        return {"status": "success", "detail": "Оценка успешно удалена"}