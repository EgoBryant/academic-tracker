from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import Base
class Subject(Base):
  __tablename__ = "subjects"
  subject_id : Mapped[int] = mapped_column(primary_key=True)
  user_id: Mapped[int] = mapped_column(
    ForeignKey("users.user_id", ondelete="CASCADE", onupdate="CASCADE"), 
    nullable=False
  )
  subject_name : Mapped[str] = mapped_column(String(100), nullable=False)
  teacher_name: Mapped[str | None] = mapped_column(String(100), default=None)
  color: Mapped[str | None] = mapped_column(String(7), default=None)