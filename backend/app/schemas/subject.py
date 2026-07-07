from pydantic import BaseModel, Field
from typing import Optional

# 1. То, что клиент МОЖЕТ прислать (и для создания, и для обновления)
class SubjectBase(BaseModel):
    subject_name: str = Field(..., min_length=1, max_length=100, description="Название предмета")
    teacher_name: Optional[str] = Field(None, max_length=100, description="ФИО преподавателя")
    color: Optional[str] = Field("#FFFFFF", max_length=7, description="Цвет предмета в формате HEX")

# 2. Схема для СОЗДАНИЯ. Здесь НЕТ никаких user_id и subject_id!
class SubjectCreate(SubjectBase):
    pass

# 3. Схема для ОБНОВЛЕНИЯ. Тоже без ID.
class SubjectUpdate(BaseModel):
    subject_name: Optional[str] = Field(None, min_length=1, max_length=100)
    teacher_name: Optional[str] = Field(None, max_length=100)
    color: Optional[str] = Field(None, max_length=7)

# 4. А вот это то, что сервер ОТДАЕТ в ответ (Response). 
# Вот здесь ID нужны фронтенду, чтобы он знал, как этот предмет отрисовать и к какому юзеру он привязался.
class SubjectResponse(SubjectBase):
    subject_id: int
    user_id: int  # В ответе сервера это поле оправдано, фронтенд его просто покажет
    average_grade: float = Field(0.0, description="Средний балл по предмету (считается автоматически)")
    class Config:
        from_attributes = True