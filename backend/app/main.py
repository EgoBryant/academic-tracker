from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Импорты движка БД и роутеров
from app.core.database import close_database_connection
from app.api.auth import router as auth_router
from app.api.subjects import router as subjects_router
from app.api.assignments import router as assignments_router
from app.api.export_import import router as export_import_router
from app.api.grade import router as grade_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield 
    await close_database_connection()


app = FastAPI(
    title="Веб-трекер успеваемости и долгов",
    version="1.0.0",
    lifespan=lifespan  
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(subjects_router)
app.include_router(assignments_router)
app.include_router(export_import_router)
app.include_router(grade_router)
@app.get("/")
async def root():
    return {"message": "API Веб-трекера успеваемости работает стабильно"}