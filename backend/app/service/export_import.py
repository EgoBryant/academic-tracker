import io
import zipfile
from datetime import datetime
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.subject import Subject
from app.models.grade import Grade
from app.models.assignment import Assignment  # Подключаем модель заданий

class DataTransferService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def export_to_xlsx(self, user_id: int) -> io.BytesIO:
        """Экспорт предметов, оценок и заданий пользователя в один XLSX файл (3 листа)"""
        # 1. Получаем данные из БД
        subjects_query = await self.db.execute(select(Subject).where(Subject.user_id == user_id))
        subjects = subjects_query.scalars().all()
        subject_ids = [s.subject_id for s in subjects]
        sub_map = {s.subject_id: s.subject_name for s in subjects}

        grades_list = []
        assignments_list = []

        if subject_ids:
            # Получаем оценки
            grades_query = await self.db.execute(select(Grade).where(Grade.subject_id.in_(subject_ids)))
            for g in grades_query.scalars().all():
                grades_list.append({
                    "Предмет": sub_map.get(g.subject_id),
                    "Значение": g.grade_value,
                    "Дата получения": g.graded_at.strftime("%Y-%m-%d") if g.graded_at else "",
                    "Описание": g.description or ""
                })

            # Получаем задания (дедлайны)
            assignments_query = await self.db.execute(select(Assignment).where(Assignment.subject_id.in_(subject_ids)))
            for a in assignments_query.scalars().all():
                assignments_list.append({
                    "Предмет": sub_map.get(a.subject_id),
                    "Название задания": a.title,
                    "Дедлайн": a.due_datetime.strftime("%Y-%m-%d %H:%M") if a.due_datetime else ""
                })

        subjects_list = [
            {
                "Предмет": s.subject_name,
                "Преподаватель": s.teacher_name or "",
                "Цвет": s.color or ""
            } for s in subjects
        ]

        # 2. Формируем DataFrame и пишем в Excel (XLSX на 3 листа)
        df_subjects = pd.DataFrame(subjects_list)
        df_grades = pd.DataFrame(grades_list)
        df_assignments = pd.DataFrame(assignments_list)

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_subjects.to_excel(writer, sheet_name='Subjects', index=False)
            df_grades.to_excel(writer, sheet_name='Grades', index=False)
            df_assignments.to_excel(writer, sheet_name='Assignments', index=False) # Третий лист
        
        output.seek(0)
        return output

    async def export_to_csv_zip(self, user_id: int) -> io.BytesIO:
        """Экспорт всех данных в виде 3-х CSV в одном ZIP-архиве"""
        subjects_query = await self.db.execute(select(Subject).where(Subject.user_id == user_id))
        subjects = subjects_query.scalars().all()
        subject_ids = [s.subject_id for s in subjects]
        sub_map = {s.subject_id: s.subject_name for s in subjects}

        subjects_list = [{"Предмет": s.subject_name, "Преподаватель": s.teacher_name or "", "Цвет": s.color or ""} for s in subjects]
        grades_list = []
        assignments_list = []

        if subject_ids:
            # Оценки
            grades_query = await self.db.execute(select(Grade).where(Grade.subject_id.in_(subject_ids)))
            for g in grades_query.scalars().all():
                grades_list.append({
                    "Предмет": sub_map.get(g.subject_id),
                    "Значение": g.grade_value,
                    "Дата получения": g.graded_at.strftime("%Y-%m-%d") if g.graded_at else "",
                    "Описание": g.description or ""
                })

            # Задания
            assignments_query = await self.db.execute(select(Assignment).where(Assignment.subject_id.in_(subject_ids)))
            for a in assignments_query.scalars().all():
                assignments_list.append({
                    "Предмет": sub_map.get(a.subject_id),
                    "Название задания": a.title,
                    "Дедлайн": a.due_datetime.strftime("%Y-%m-%d %H:%M") if a.due_datetime else ""
                })

        df_subjects = pd.DataFrame(subjects_list)
        df_grades = pd.DataFrame(grades_list)
        df_assignments = pd.DataFrame(assignments_list)

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            zip_file.writestr("subjects.csv", df_subjects.to_csv(index=False, sep=';', encoding='utf-8'))
            zip_file.writestr("grades.csv", df_grades.to_csv(index=False, sep=';', encoding='utf-8'))
            zip_file.writestr("assignments.csv", df_assignments.to_csv(index=False, sep=';', encoding='utf-8'))
        
        zip_buffer.seek(0)
        return zip_buffer

    async def import_data(self, file_bytes: bytes, file_type: str, user_id: int) -> dict:
        """Универсальный импорт всех таблиц (XLSX или CSV/ZIP)"""
        df_subjects = pd.DataFrame()
        df_grades = pd.DataFrame()
        df_assignments = pd.DataFrame()

        # 1. Чтение структуры
        try:
            if file_type == "xlsx":
                excel_file = pd.ExcelFile(io.BytesIO(file_bytes))
                if 'Subjects' in excel_file.sheet_names:
                    df_subjects = excel_file.parse('Subjects')
                if 'Grades' in excel_file.sheet_names:
                    df_grades = excel_file.parse('Grades')
                if 'Assignments' in excel_file.sheet_names:
                    df_assignments = excel_file.parse('Assignments')
            elif file_type in ("csv", "zip"):
                with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                    if "subjects.csv" in z.namelist():
                        df_subjects = pd.read_csv(z.open("subjects.csv"), sep=';', encoding='utf-8')
                    if "grades.csv" in z.namelist():
                        df_grades = pd.read_csv(z.open("grades.csv"), sep=';', encoding='utf-8')
                    if "assignments.csv" in z.namelist():
                        df_assignments = pd.read_csv(z.open("assignments.csv"), sep=';', encoding='utf-8')
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Ошибка чтения структуры файла: {str(e)}")

        import_logs = []
        subjects_imported = 0
        grades_imported = 0
        assignments_imported = 0

        df_subjects = df_subjects.fillna("")
        df_grades = df_grades.fillna("")
        df_assignments = df_assignments.fillna("")

        subject_name_to_id = {}

        # 2. Импорт предметов (Subjects)
        if not df_subjects.empty:
            for index, row in df_subjects.iterrows():
                row_num = index + 2
                subject_name = str(row.get("Предмет", "")).strip()

                if not subject_name:
                    import_logs.append(f"Строка {row_num} (Предметы): Отклонено. Пропущено имя предмета.")
                    continue

                teacher_name = str(row.get("Преподаватель", "")).strip()
                color = str(row.get("Цвет", "")).strip()

                stmt = select(Subject).where(Subject.user_id == user_id, Subject.subject_name == subject_name)
                existing_sub = (await self.db.execute(stmt)).scalar_one_or_none()

                if existing_sub:
                    existing_sub.teacher_name = teacher_name if teacher_name else existing_sub.teacher_name
                    existing_sub.color = color if color else existing_sub.color
                    subject_id = existing_sub.subject_id
                    import_logs.append(f"Строка {row_num} (Предметы): Обновлен существующий предмет '{subject_name}'.")
                else:
                    new_sub = Subject(user_id=user_id, subject_name=subject_name, teacher_name=teacher_name, color=color or "#3b82f6")
                    self.db.add(new_sub)
                    await self.db.flush()
                    subject_id = new_sub.subject_id
                    subjects_imported += 1

                subject_name_to_id[subject_name] = subject_id

        # Синхронизируем маппинг с базой
        stmt_all = select(Subject).where(Subject.user_id == user_id)
        for s in (await self.db.execute(stmt_all)).scalars().all():
            if s.subject_name not in subject_name_to_id:
                subject_name_to_id[s.subject_name] = s.subject_id

        # 3. Импорт оценок (Grades)
        if not df_grades.empty:
            for index, row in df_grades.iterrows():
                row_num = index + 2
                target_subject_name = str(row.get("Предмет", "")).strip()
                grade_value = str(row.get("Значение", "")).strip()
                graded_at_str = str(row.get("Дата получения", "")).strip()
                description = str(row.get("Описание", "")).strip()

                if not target_subject_name or not grade_value:
                    import_logs.append(f"Строка {row_num} (Оценки): Отклонено. Пропущены обязательные поля.")
                    continue

                if target_subject_name not in subject_name_to_id:
                    import_logs.append(f"Строка {row_num} (Оценки): Ошибка. Предмет '{target_subject_name}' не найден.")
                    continue

                associated_subject_id = subject_name_to_id[target_subject_name]
                parsed_date = datetime.now()
                if graded_at_str:
                    try:
                        parsed_date = pd.to_datetime(graded_at_str).to_pydatetime()
                    except Exception:
                        import_logs.append(f"Строка {row_num} (Оценки): Некорректный формат даты. Взята текущая дата.")

                grade_stmt = select(Grade).where(
                    Grade.subject_id == associated_subject_id,
                    Grade.grade_value == grade_value,
                    Grade.description == description
                )
                existing_grade = (await self.db.execute(grade_stmt)).scalar_one_or_none()

                if existing_grade:
                    existing_grade.graded_at = parsed_date
                    import_logs.append(f"Строка {row_num} (Оценки): Обновлена дата существующей оценки.")
                else:
                    self.db.add(Grade(subject_id=associated_subject_id, grade_value=grade_value, graded_at=parsed_date, description=description))
                    grades_imported += 1

        # 4. НОВЫЙ БЛОК: Импорт заданий (Assignments)
        if not df_assignments.empty:
            for index, row in df_assignments.iterrows():
                row_num = index + 2
                target_subject_name = str(row.get("Предмет", "")).strip()
                title = str(row.get("Название задания", "")).strip()
                due_datetime_str = str(row.get("Дедлайн", "")).strip()

                if not target_subject_name or not title:
                    import_logs.append(f"Строка {row_num} (Задания): Отклонено. Отсутствует название предмета или задания.")
                    continue

                if target_subject_name not in subject_name_to_id:
                    import_logs.append(f"Строка {row_num} (Задания): Ошибка. Предмет '{target_subject_name}' не найден.")
                    continue

                associated_subject_id = subject_name_to_id[target_subject_name]
                parsed_deadline = None
                if due_datetime_str:
                    try:
                        parsed_deadline = pd.to_datetime(due_datetime_str).to_pydatetime()
                    except Exception:
                        import_logs.append(f"Строка {row_num} (Задания): Не удалось распознать формат дедлайна '{due_datetime_str}'.")

                # Проверка на дубликат задания по названию внутри одного предмета
                assign_stmt = select(Assignment).where(
                    Assignment.subject_id == associated_subject_id,
                    Assignment.title == title
                )
                existing_assign = (await self.db.execute(assign_stmt)).scalar_one_or_none()

                if existing_assign:
                    existing_assign.due_datetime = parsed_deadline if parsed_deadline else existing_assign.due_datetime
                    import_logs.append(f"Строка {row_num} (Задания): Обновлен дедлайн для существующего задания '{title}'.")
                else:
                    self.db.add(Assignment(subject_id=associated_subject_id, title=title, due_datetime=parsed_deadline))
                    assignments_imported += 1

        await self.db.commit()

        return {
            "status": "success",
            "imported_subjects": subjects_imported,
            "imported_grades": grades_imported,
            "imported_assignments": assignments_imported,
            "logs": import_logs
        }