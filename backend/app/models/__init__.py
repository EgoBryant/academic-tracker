from app.core.database import Base
from app.models.user import User
from app.models.subject import Subject
from app.models.assignment import Assignment
from app.models.grade import Grade

# Определяем, что именно будет экспортироваться при импорте из пакета models
__all__ = [
    "Base",
    "User",
    "Subject",
    "Assignment",
    "Grade",
]