from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm  # <-- Добавили импорт формы
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import UserRegister, UserResponse, UserLogin, Token
from app.repository.user import UserRepository
from app.service.auth import AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    user_repo = UserRepository(db)
    return AuthService(user_repo)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegister, 
    auth_service: AuthService = Depends(get_auth_service)
):
    """Эндпоинт регистрации пользователя."""
    return await auth_service.register_user(user_in)

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    auth_service: AuthService = Depends(get_auth_service)
):
    """Эндпоинт авторизации (выдача токена)."""
    

    user_in = UserLogin(email=form_data.username, password=form_data.password)
    
    return await auth_service.authenticate_user(user_in)