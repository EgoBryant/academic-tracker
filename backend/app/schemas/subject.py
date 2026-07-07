from pydantic import BaseModel, ConfigDict, Field

# Общие поля предмета согласно ТЗ
class SubjectBase(BaseModel):
    subject_name: str = Field(..., min_length=1, max_length=100)
    teacher_name: str | None = Field(None, max_length=100)
    color: str | None = Field(None, max_length=7)

# Схема для создания (POST) — добавляем user_id
class SubjectCreate(SubjectBase):
    user_id: int  # Обязательное поле связи с пользователем из ТЗ

# Схема для обновления (PUT)
class SubjectUpdate(BaseModel):
    subject_name: str | None = Field(None, min_length=1, max_length=100)
    teacher_name: str | None = Field(None, max_length=100)
    color: str | None = Field(None, max_length=7)
    user_id: int | None = None

# Схема ответа (GET, POST, PUT)
class SubjectResponse(SubjectBase):
    subject_id: int
    user_id: int  # Возвращаем тоже, чтобы фронтенд видел владельца

    model_config = ConfigDict(from_attributes=True)