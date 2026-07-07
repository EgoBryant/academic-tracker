from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.grade import Grade
from app.models.subject import Subject
from app.schemas.grade import GradeCreate, GradeUpdate
# Импортируем пересчет (если написал его в subject_service, импортируй класс)
# Для простоты покажем, как вызвать это прямо через сессию db в методах:

class GradeService:
    def __init__(self, db):
        self.db = db

    async def _recalculate_subject_avg(self, subject_id: int):
        """Вспомогательный метод для пересчета среднего балла предмета"""
        query = select(Grade.grade_value).where(Grade.subject_id == subject_id)
        result = await self.db.execute(query)
        grades_list = result.scalars().all()

        valid_grades = []
        for val in grades_list:
            try:
                valid_grades.append(float(val))
            except (ValueError, TypeError):
                continue
        
        avg_value = round(sum(valid_grades) / len(valid_grades), 2) if valid_grades else 0.0
        
        from sqlalchemy import update
        await self.db.execute(
            update(Subject).where(Subject.subject_id == subject_id).values(average_grade=avg_value)
        )
        await self.db.commit()

    async def get_grades(self, subject_id: int, user_id: int):
      # 1. Сначала проверьте, существует ли предмет и принадлежит ли он пользователю
      # (Это важно для безопасности)
      
      # 2. Получите список оценок
      query = select(Grade).where(Grade.subject_id == subject_id)
      result = await self.db.execute(query)
      grades = result.scalars().all()  # .all() вернет список, даже если он пустой []

      # 3. Верните результат
      # Убедитесь, что вы не делаете return None где-то выше
      return grades if grades is not None else []

    async def create_grade(self, subject_id: int, grade_in: GradeCreate, user_id: int):
        # 1. Твой код проверки прав на предмет и добавления оценки
        new_grade = Grade(
            subject_id=subject_id,
            grade_value=grade_in.grade_value,
            description=grade_in.description,
            graded_at=grade_in.graded_at
        )
        self.db.add(new_grade)
        await self.db.commit()
        await self.db.refresh(new_grade)

        # 2. АВТОМАТИЧЕСКИЙ ПЕРЕСЧЕТ ПОСЛЕ СОЗДАНИЯ
        await self._recalculate_subject_avg(subject_id)

        return new_grade

    async def update_grade(self, grade_id: int, grade_in: GradeUpdate, user_id: int):
        # 1. Получаем оценку и проверяем права
        query = select(Grade).where(Grade.grade_id == grade_id)
        result = await self.db.execute(query)
        grade = result.scalar_one_or_none()
        
        if not grade:
            raise HTTPException(status_code=404, detail="Grade not found")
            
        # 2. Обновляем поля
        if grade_in.grade_value is not None:
            grade.grade_value = grade_in.grade_value
        if grade_in.description is not None:
            grade.description = grade_in.description
        if grade_in.graded_at is not None:
            grade.graded_at = grade_in.graded_at
            
        await self.db.commit()
        await self.db.refresh(grade)

        # 3. АВТОМАТИЧЕСКИЙ ПЕРЕСЧЕТ ПОСЛЕ ОБНОВЛЕНИЯ
        await self._recalculate_subject_avg(grade.subject_id)

        return grade

    async def delete_grade(self, grade_id: int, user_id: int):
        # 1. Находим оценку, чтобы узнать subject_id перед удалением
        query = select(Grade).where(Grade.grade_id == grade_id)
        result = await self.db.execute(query)
        grade = result.scalar_one_or_none()
        
        if not grade:
            raise HTTPException(status_code=404, detail="Grade not found")
            
        subject_id = grade.subject_id

        # 2. Удаляем
        await self.db.delete(grade)
        await self.db.commit()

        # 3. АВТОМАТИЧЕСКИЙ ПЕРЕСЧЕТ ПОСЛЕ УДАЛЕНИЯ
        await self._recalculate_subject_avg(subject_id)