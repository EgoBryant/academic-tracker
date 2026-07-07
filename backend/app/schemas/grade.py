from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# Базовая схема — определяет входящие данные
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

# Схема для создания
class GradeCreate(GradeBase):
    pass

# Схема для обновления
class GradeUpdate(BaseModel):
    grade_value: Optional[str] = Field(None, max_length=10)
    description: Optional[str] = Field(None, max_length=200)
    graded_at: Optional[date] = None

# Схема для ответа сервера (Response)
class GradeResponse(BaseModel):
    grade_id: int
    subject_id: int
    grade_value: str
    description: Optional[str]
    # Фронтенд получит дату строго в формате YYYY-MM-DD
    graded_at: date 

    class Config:
        from_attributes = True