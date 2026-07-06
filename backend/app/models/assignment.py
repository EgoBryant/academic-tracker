from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Assignment(Base):
  __tablename__ = "assignments"
  assignment_id : Mapped[int] = mapped_column(primary_key=True)
  subject_id: Mapped[int] = mapped_column(
    ForeignKey("subjects.subject_id", ondelete="CASCADE", onupdate="CASCADE"), 
    nullable=False
  )
  title: Mapped[str] = mapped_column(String(100), nullable=False)
  due_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)