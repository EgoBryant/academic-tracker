from fastapi import HTTPException, status
from app.repository.assignment import AssignmentRepository
from app.repository.subjects import SubjectRepository
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate
from app.models.assignment import Assignment

class AssignmentService:
    def __init__(self, repo: AssignmentRepository, subject_repo: SubjectRepository):
        self.repo = repo
        self.subject_repo = subject_repo

    async def get_user_assignments(self, user_id: int):
        return await self.repo.get_all_by_user(user_id)

    async def create_assignment(self, data: AssignmentCreate, user_id: int):
        subject = await self.subject_repo.get_by_id(data.subject_id, user_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Предмет не найден или нет доступа"
            )
            
        new_assignment = Assignment(
            subject_id=data.subject_id,
            title=data.title,
            due_datetime=data.due_datetime
        )
        
        created = await self.repo.create(new_assignment)
        
        await self.repo.commit()
        await self.repo.refresh(created)
        return created

    async def update_assignment(self, assignment_id: int, data: AssignmentUpdate, user_id: int):
        assignment = await self.repo.get_by_id(assignment_id)
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Задание не найдено"
            )
            
        target_subject_id = data.subject_id if data.subject_id is not None else assignment.subject_id
        subject = await self.subject_repo.get_by_id(target_subject_id, user_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Нет прав на этот предмет"
            )

        if data.title is not None:
            assignment.title = data.title
        if data.subject_id is not None:
            assignment.subject_id = data.subject_id
        if data.due_datetime is not None:
            assignment.due_datetime = data.due_datetime

        await self.repo.commit()
        await self.repo.refresh(assignment)
        return assignment

    async def delete_assignment(self, assignment_id: int, user_id: int):
        assignment = await self.repo.get_by_id(assignment_id)
        if not assignment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Задание не найдено"
            )

        subject = await self.subject_repo.get_by_id(assignment.subject_id, user_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Нет прав на изменение этого предмета"
            )

        await self.repo.delete(assignment)
        await self.repo.commit()
        return {"status": "success", "detail": "Задание успешно удалено"}