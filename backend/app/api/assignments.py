from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.service.assignment import AssignmentService

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])

def get_assignment_service(db: AsyncSession = Depends(get_db)) -> AssignmentService:
    return AssignmentService(db)

@router.get("/", response_model=List[AssignmentResponse])
async def get_all_assignments(
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Получить все дедлайны пользователя для календаря"""
    # Возвращаем пустой список [], а не None, чтобы не было ошибки валидации
    assignments = await service.get_user_assignments(current_user.user_id)
    return assignments if assignments else []

@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assignment(
    assignment_in: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Создать новое задание/дедлайн"""
    return await service.create_assignment(assignment_in, current_user.user_id)

@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: int,
    assignment_in: AssignmentUpdate,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Редактировать существующее задание"""
    return await service.update_assignment(assignment_id, assignment_in, current_user.user_id)

@router.delete("/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service)
):
    """Удалить задание"""
    await service.delete_assignment(assignment_id, current_user.user_id)
    return None