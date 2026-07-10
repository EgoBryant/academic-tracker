from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    assignment_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("subjects.subject_id", ondelete="CASCADE"), 
        nullable=False
    )
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    
    due_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)