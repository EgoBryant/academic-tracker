from pydantic import BaseModel, ConfigDict

# Общие поля для всех схем предмета
class SubjectBase(BaseModel):
    name: str
    description: str | None = None  # Используем современный str | None вместо Optional

# Схема для создания (POST)
class SubjectCreate(SubjectBase):
    pass

# Схема для обновления (PUT)
class SubjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

# Схема ответа (GET, POST, PUT)
class SubjectResponse(SubjectBase):
    id: int

    # Включаем чтение данных из существующих ORM-моделей
    model_config = ConfigDict(from_attributes=True)