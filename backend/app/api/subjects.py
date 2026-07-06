
import select
from statistics import quantiles
from unittest import result
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.subject import Subject
from app.schemas.subject import SubjectResponse , SubjectCreate, SubjectUpdate  
from app.core.database import get_db


router = APIRouter(prefix="/api/subjects", tags=["Subjects"])

@router.get("/", response_model= list[SubjectResponse])
async def get_subjects(db: AsyncSession = Depends(get_db)):
  query = select(Subject).order_by(Subject.id)
  result = await db.execute(query)
  return result.scalars().all()

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(subject_in: SubjectCreate, db: AsyncSession = Depends(get_db)):
    query = select(Subject).where(Subject.name == subject_in.name)
    existing = await db.execute(query)
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Предмет с таким названием уже существует"
        )
    
    db_subject = Subject(**subject_in.model_dump())
    db.add(db_subject)
    await db.commit()
    await db.refresh(db_subject)
    return db_subject

@router.put("/{id}", response_model=SubjectResponse)
async def update_subject(id: int, subject_in: SubjectUpdate, db: AsyncSession = Depends(get_db)):
    query = select(Subject).where(Subject.id == id)
    result = await db.execute(query)
    db_subject = result.scalar_one_or_none()
    
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Предмет не найден"
        )
    
    update_data = subject_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subject, key, value)
        
    await db.commit()
    await db.refresh(db_subject)
    return db_subject

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(id: int, db: AsyncSession = Depends(get_db)):
    query = select(Subject).where(Subject.id == id)
    result = await db.execute(query)
    db_subject = result.scalar_one_or_none()
    
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Предмет не найден"
        )
    
    await db.delete(db_subject)
    await db.commit()
    return None

