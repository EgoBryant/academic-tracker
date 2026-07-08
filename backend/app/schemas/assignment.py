from datetime import datetime
from pydantic import BaseModel, field_validator, field_serializer, ConfigDict

class AssignmentBase(BaseModel):
    title: str
    subject_id: int

class AssignmentCreate(AssignmentBase):
    due_datetime: datetime

    @field_validator('due_datetime', mode='before')
    @classmethod
    def parse_and_truncate_to_minutes(cls, v):
        if isinstance(v, str):
            # Перебираем все возможные маски, которые может прислать фронтенд
            for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d %H:%M:%S"):
                try:
                    dt = datetime.strptime(v, fmt)
                    return dt.replace(second=0, microsecond=0, tzinfo=None)
                except ValueError:
                    continue
            
            # Если через strptime не вышло, пробуем универсальный isoformat
            try:
                dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                return dt.replace(second=0, microsecond=0, tzinfo=None)
            except ValueError:
                raise ValueError("Неверный формат даты. Ожидается YYYY-MM-DD HH:MM или ISO-8601")
                
        elif isinstance(v, datetime):
            return v.replace(second=0, microsecond=0, tzinfo=None)
        return v

class AssignmentUpdate(BaseModel):
    title: str | None = None
    subject_id: int | None = None
    due_datetime: datetime | None = None

    @field_validator('due_datetime', mode='before')
    @classmethod
    def parse_and_truncate_to_minutes(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%d %H:%M:%S"):
                try:
                    dt = datetime.strptime(v, fmt)
                    return dt.replace(second=0, microsecond=0, tzinfo=None)
                except ValueError:
                    continue
            try:
                dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                return dt.replace(second=0, microsecond=0, tzinfo=None)
            except ValueError:
                raise ValueError("Неверный формат даты")
        elif isinstance(v, datetime):
            return v.replace(second=0, microsecond=0, tzinfo=None)
        return v

class AssignmentResponse(AssignmentBase):
    assignment_id: int
    due_datetime: datetime

    model_config = ConfigDict(from_attributes=True)

    # КРИТИЧЕСКИ ВАЖНО: Форматируем вывод JSON строго по вашему ТЗ
    @field_serializer('due_datetime')
    def serialize_dt(self, dt: datetime, _info):
        return dt.strftime("%Y-%m-%d %H:%M")