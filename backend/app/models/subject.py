from sqlalchemy import String, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    subject_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    subject_name: Mapped[str] = mapped_column(String(100), nullable=False)
    teacher_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)
    
    average_grade: Mapped[float] = mapped_column(Float, default=0.0, server_default="0.0", nullable=False)