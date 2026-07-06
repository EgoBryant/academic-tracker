from core.database import Base
from backend.app.models.user import User
from backend.app.models.subject import Subject
from backend.app.models.assignment import Assignment
from backend.app.models.grade import Grade

# Определяем, что именно будет экспортироваться при импорте из пакета models
__all__ = [
    "Base",
    "User",
    "Subject",
    "Assignment",
    "Grade",
]