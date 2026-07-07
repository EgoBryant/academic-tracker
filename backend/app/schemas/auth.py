from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    # Валидация согласно разделу 2.1.1 ТЗ: строка от 2 до 100 символов
    full_name: str = Field(..., min_length=2, max_length=100, description="ФИО пользователя")
    email: EmailStr = Field(..., description="Логин (электронная почта)")
    # Пароль минимум 8 символов
    password: str = Field(..., min_length=8, description="Пароль (латиница, мин. 8 символов)")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    user_id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse  # По спецификации ТЗ возвращаем токен вместе с данными юзера