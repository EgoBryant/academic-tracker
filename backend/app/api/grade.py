from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.grade import GradeResponse, GradeCreate, GradeUpdate
from app.service.grade import GradeService

router = APIRouter(tags=["Grades"])

# Фабрика для инициализации сервиса оценок
def get_grade_service(db: AsyncSession = Depends(get_db)) -> GradeService:
    return GradeService(db)


@router.get("/api/subjects/{subject_id}/grades", response_model=List[GradeResponse])
async def get_grades(
    subject_id: int,
    current_user: User = Depends(get_current_user),
    service: GradeService = Depends(get_grade_service)
):
    """
    Получение всех оценок по конкретному предмету.
    Доступно только владельцу предмета.
    """
    return await service.get_grades(subject_id, current_user.user_id)


@router.post("/api/subjects/{subject_id}/grades", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
async def create_grade(
    subject_id: int,
    grade_in: GradeCreate,
    current_user: User = Depends(get_current_user),
    service: GradeService = Depends(get_grade_service)
):
    """
    Добавление новой оценки к предмету.
    Принимает строку (например, '5', 'A', '80'), описание (до 200 символов) и дату YYYY-MM-DD.
    """
    return await service.create_grade(subject_id, grade_in, current_user.user_id)


@router.put("/api/grades/{grade_id}", response_model=GradeResponse)
async def update_grade(
    grade_id: int,
    grade_in: GradeUpdate,
    current_user: User = Depends(get_current_user),
    service: GradeService = Depends(get_grade_service)
):
    """
    Изменение существующей оценки (значение, описание или дата).
    """
    return await service.update_grade(grade_id, grade_in, current_user.user_id)


@router.delete("/api/grades/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_grade(
    grade_id: int,
    current_user: User = Depends(get_current_user),
    service: GradeService = Depends(get_grade_service)
):
    """
    Удаление оценки по её ID.
    """
    await service.delete_grade(grade_id, current_user.user_id)
    return None