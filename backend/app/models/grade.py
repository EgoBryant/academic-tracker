from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Grade(Base):
    __tablename__ = "grades"
    
    grade_id : Mapped[int] = mapped_column(primary_key=True)
    subject_id: Mapped[int] = mapped_column(
        ForeignKey("subjects.subject_id", ondelete="CASCADE", onupdate="CASCADE"),
        nullable=False
    )
    grade_value: Mapped[str] = mapped_column(String(10), nullable=False)
    graded_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, default=None)