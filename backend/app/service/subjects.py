from fastapi import HTTPException, status
from app.repository.subjects import SubjectRepository
from app.schemas.subject import SubjectCreate, SubjectUpdate

class SubjectService:
    def __init__(self, subject_repo: SubjectRepository):
        self.subject_repo = subject_repo

    async def get_user_subjects(self, user_id: int):
        return await self.subject_repo.get_all_by_user(user_id)

    async def create_user_subject(self, subject_in: SubjectCreate, user_id: int):
        # Проверяем дубликат имени предмета через метод репозитория
        existing = await self.subject_repo.get_by_name(subject_in.subject_name, user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Предмет с таким названием уже существует"
            )
        
        # Репозиторий делает только .flush()
        db_subject = await self.subject_repo.create(subject_in, user_id)
        
        # Сервис управляет транзакцией (Unit of Work)
        await self.subject_repo.commit()
        await self.subject_repo.refresh(db_subject)
        return db_subject

    async def update_user_subject(self, subject_id: int, subject_in: SubjectUpdate, user_id: int):
        db_subject = await self.subject_repo.get_by_id(subject_id, user_id)
        if not db_subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Предмет не найден"
            )
        
        update_data = subject_in.model_dump(exclude_unset=True)
        updated_subject = await self.subject_repo.update(db_subject, update_data)
        
        # Фиксируем изменения в БД
        await self.subject_repo.commit()
        await self.subject_repo.refresh(updated_subject)
        return updated_subject

    async def delete_user_subject(self, subject_id: int, user_id: int):
        db_subject = await self.subject_repo.get_by_id(subject_id, user_id)
        if not db_subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Предмет не найден"
            )
        
        await self.subject_repo.delete(db_subject)
        # Фиксируем удаление
        await self.subject_repo.commit()
        return None
    
    async def recalculate_average_grade(self, subject_id: int) -> float:
        """Пересчитывает средний балл для предмета и сохраняет его в БД."""
        # 1. Запрос списка оценок делегирован репозиторию
        grades_list = await self.subject_repo.get_grade_values_by_subject(subject_id)

        if not grades_list:
            avg_value = 0.0
        else:
            # Бизнес-логика фильтрации и подсчета остается в сервисе
            valid_grades = []
            for val in grades_list:
                try:
                    valid_grades.append(float(val))
                except (ValueError, TypeError):
                    continue  # Игнорируем строки типа "зачет"
            
            avg_value = round(sum(valid_grades) / len(valid_grades), 2) if valid_grades else 0.0

        # 2. Обновление поля average_grade делегировано репозиторию (выполняется .flush())
        await self.subject_repo.update_average_field(subject_id, avg_value)
        
        # 3. Сервис подтверждает транзакцию
        await self.subject_repo.commit()
        
        return avg_value