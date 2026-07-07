from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.repository.subjects import SubjectRepository
from app.service.subjects import SubjectService

router = APIRouter(prefix="/v1/subjects", tags=["Subjects"])

# Конструктор сборки слоев для предметов
def get_subject_service(db: AsyncSession = Depends(get_db)) -> SubjectService:
    subject_repo = SubjectRepository(db)
    return SubjectService(subject_repo)

@router.get("/", response_model=List[SubjectResponse])
async def get_subjects(
    current_user: User = Depends(get_current_user),
    service: SubjectService = Depends(get_subject_service)
):
    """Получение списка всех предметов текущего студента."""
    return await service.get_user_subjects(current_user.user_id)

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject_in: SubjectCreate,
    current_user: User = Depends(get_current_user),
    service: SubjectService = Depends(get_subject_service)
):
    """Создание нового предмета."""
    return await service.create_user_subject(subject_in, current_user.user_id)

@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    subject_in: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    service: SubjectService = Depends(get_subject_service)
):
    """Редактирование параметров предмета."""
    return await service.update_user_subject(subject_id, subject_in, current_user.user_id)

@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: int,
    current_user: User = Depends(get_current_user),
    service: SubjectService = Depends(get_subject_service)
):
    """Удаление предмета."""
    await service.delete_user_subject(subject_id, current_user.user_id)
    return None