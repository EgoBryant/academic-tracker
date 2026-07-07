from fastapi import HTTPException, status
from app.repository.subjects import SubjectRepository
from app.schemas.subject import SubjectCreate, SubjectUpdate

class SubjectService:
    def __init__(self, subject_repo: SubjectRepository):
        self.subject_repo = subject_repo

    async def get_user_subjects(self, user_id: int):
        return await self.subject_repo.get_all_by_user(user_id)

    async def create_user_subject(self, subject_in: SubjectCreate, user_id: int):
        # Проверяем дубликат имени предмета только ДЛЯ ЭТОГО пользователя
        existing = await self.subject_repo.get_by_name(subject_in.subject_name, user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Предмет с таким названием уже существует"
            )
        return await self.subject_repo.create(subject_in, user_id)

    async def update_user_subject(self, subject_id: int, subject_in: SubjectUpdate, user_id: int):
        db_subject = await self.subject_repo.get_by_id(subject_id, user_id)
        if not db_subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Предмет не найден"
            )
        
        update_data = subject_in.model_dump(exclude_unset=True)
        return await self.subject_repo.update(db_subject, update_data)

    async def delete_user_subject(self, subject_id: int, user_id: int):
        db_subject = await self.subject_repo.get_by_id(subject_id, user_id)
        if not db_subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Предмет не найден"
            )
        await self.subject_repo.delete(db_subject)
        return None