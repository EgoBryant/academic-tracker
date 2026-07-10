from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class GradeBase(BaseModel):
    grade_value: str = Field(
        ..., 
        max_length=10, 
        description="Значение оценки (например: '5', '4.5', 'A', '80')"
    )
    description: Optional[str] = Field(
        None, 
        max_length=200, 
        description="Описание работы/оценки (макс. 200 символов)"
    )
    graded_at: Optional[date] = Field(
        None, 
        description="Дата получения в формате YYYY-MM-DD"
    )

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    grade_value: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = Field(None, max_length=200)
    graded_at: Optional[date] = None

class GradeResponse(BaseModel):
    grade_id: int
    subject_id: int
    grade_value: str
    description: Optional[str]
    graded_at: date 

    class Config:
        from_attributes = True