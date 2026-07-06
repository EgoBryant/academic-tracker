from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

class User(Base):
  __tablename__ = "users"

  user_id : Mapped[int] = mapped_column(primary_key=True, index=True)
  full_name : Mapped[str] = mapped_column(String(255), nullable=False)
  email : Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
  password : Mapped[str] = mapped_column(String(255), nullable=False)