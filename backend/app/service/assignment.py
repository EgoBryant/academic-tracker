from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.assignment import AssignmentRepository
from app.repository.subjects import SubjectRepository
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate
from app.models.assignment import Assignment

class AssignmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AssignmentRepository(db)
        self.subject_repo = SubjectRepository(db)

    async def get_user_assignments(self, user_id: int):
        return await self.repo.get_all_by_user(user_id)

    async def create_assignment(self, data: AssignmentCreate, user_id: int):
        # Исправлено: передаем вторым аргументом user_id для проверки прав
        subject = await self.subject_repo.get_by_id(data.subject_id, user_id)
        if not subject:
            raise HTTPException(status_code=404, detail="Предмет не найден или нет доступа")
            
        new_assignment = Assignment(
            subject_id=data.subject_id,
            title=data.title,
            due_datetime=data.due_datetime  # Схема уже гарантирует формат без таймзон
        )
        created = await self.repo.create(new_assignment)
        await self.db.commit()
        await self.db.refresh(created)
        return created

    async def update_assignment(self, assignment_id: int, data: AssignmentUpdate, user_id: int):
        assignment = await self.repo.get_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Задание не найдено")
            
        # Проверяем доступ к предмету (новому, если его меняют, или текущему)
        target_subject_id = data.subject_id if data.subject_id is not None else assignment.subject_id
        subject = await self.subject_repo.get_by_id(target_subject_id, user_id)
        if not subject:
            raise HTTPException(status_code=403, detail="Нет прав на этот предмет")

        if data.title is not None:
            assignment.title = data.title
        if data.subject_id is not None:
            assignment.subject_id = data.subject_id
        if data.due_datetime is not None:
            assignment.due_datetime = data.due_datetime

        await self.db.commit()
        await self.db.refresh(assignment)
        return assignment

    async def delete_assignment(self, assignment_id: int, user_id: int):
        assignment = await self.repo.get_by_id(assignment_id)
        if not assignment:
            raise HTTPException(status_code=404, detail="Задание не найдено")

        subject = await self.subject_repo.get_by_id(assignment.subject_id, user_id)
        if not subject:
            raise HTTPException(status_code=403, detail="Нет прав на изменение этого предмета")

        await self.db.delete(assignment)
        await self.db.commit()