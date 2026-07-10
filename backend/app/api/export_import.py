from fastapi import APIRouter, Depends, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db  
from app.core.security import get_current_user  
from app.models.user import User
from app.service.export_import import DataTransferService

router = APIRouter(prefix="/data", tags=["Экспорт и Импорт данных"])

@router.get("/export/xlsx")
async def export_xlsx(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Экспорт всех предметов и оценок в один структурированный файл Excel (XLSX)"""
    service = DataTransferService(db)
    file_stream = await service.export_to_xlsx(current_user.user_id)
    
    filename = f"academic_backup_{current_user.user_id}.xlsx"
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/csv")
async def export_csv(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Экспорт данных в виде ZIP-архива, содержащего раздельные CSV-файлы для таблиц"""
    service = DataTransferService(db)
    file_stream = await service.export_to_csv_zip(current_user.user_id)
    
    filename = f"academic_backup_{current_user.user_id}.zip"
    return StreamingResponse(
        file_stream,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/import")
async def import_user_data(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Универсальный импорт данных. Принимает файлы .xlsx или .zip (содержащий CSV файлы).
    При совпадении названий предметов/оценок данные обновляются.
    """
    filename = file.filename.lower()
    if filename.endswith(".xlsx"):
        file_type = "xlsx"
    elif filename.endswith(".zip") or filename.endswith(".csv"):
        file_type = "zip"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Неподдерживаемый формат файла. Разрешены только .xlsx и .zip"
        )

    file_bytes = await file.read()
    service = DataTransferService(db)
    result = await service.import_data(file_bytes, file_type, current_user.user_id)
    
    return result