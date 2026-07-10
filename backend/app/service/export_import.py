import io
import zipfile
from datetime import datetime
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject import Subject
from app.models.grade import Grade
from app.models.assignment import Assignment
from app.repository.export_import import DataTransferRepository  

class DataTransferService:
    def __init__(self, db: AsyncSession):
        self.repo = DataTransferRepository(db)

    async def export_to_xlsx(self, user_id: int) -> io.BytesIO:
        subjects = await self.repo.get_subjects_by_user(user_id)
        subject_ids = [s.subject_id for s in subjects]
        sub_map = {s.subject_id: s.subject_name for s in subjects}

        grades_list = []
        assignments_list = []

        if subject_ids:
            db_grades = await self.repo.get_grades_by_subject_ids(subject_ids)
            for g in db_grades:
                grades_list.append({
                    "Предмет": sub_map.get(g.subject_id),
                    "Значение": g.grade_value,
                    "Дата получения": g.graded_at.strftime("%Y-%m-%d") if g.graded_at else "",
                    "Описание": g.description or ""
                })

            db_assignments = await self.repo.get_assignments_by_subject_ids(subject_ids)
            for a in db_assignments:
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

        df_subjects = pd.DataFrame(subjects_list)
        df_grades = pd.DataFrame(grades_list)
        df_assignments = pd.DataFrame(assignments_list)

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_subjects.to_excel(writer, sheet_name='Subjects', index=False)
            df_grades.to_excel(writer, sheet_name='Grades', index=False)
            df_assignments.to_excel(writer, sheet_name='Assignments', index=False)
        
        output.seek(0)
        return output

    async def export_to_csv_zip(self, user_id: int) -> io.BytesIO:
        """Экспорт всех данных в виде 3-х CSV в одном ZIP-архиве"""
        subjects = await self.repo.get_subjects_by_user(user_id)
        subject_ids = [s.subject_id for s in subjects]
        sub_map = {s.subject_id: s.subject_name for s in subjects}

        subjects_list = [{"Предмет": s.subject_name, "Преподаватель": s.teacher_name or "", "Цвет": s.color or ""} for s in subjects]
        grades_list = []
        assignments_list = []

        if subject_ids:
            db_grades = await self.repo.get_grades_by_subject_ids(subject_ids)
            for g in db_grades:
                grades_list.append({
                    "Предмет": sub_map.get(g.subject_id),
                    "Значение": g.grade_value,
                    "Дата получения": g.graded_at.strftime("%Y-%m-%d") if g.graded_at else "",
                    "Описание": g.description or ""
                })

            db_assignments = await self.repo.get_assignments_by_subject_ids(subject_ids)
            for a in db_assignments:
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
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Ошибка чтения структуры файла: {str(e)}")

        import_logs = []
        subjects_imported = 0
        grades_imported = 0
        assignments_imported = 0

        df_subjects = df_subjects.fillna("")
        df_grades = df_grades.fillna("")
        df_assignments = df_assignments.fillna("")

        subject_name_to_id = {}

        if not df_subjects.empty:
            for index, row in df_subjects.iterrows():
                row_num = index + 2
                subject_name = str(row.get("Предмет", "")).strip()

                if not subject_name:
                    import_logs.append(f"Строка {row_num} (Предметы): Отклонено. Пропущено имя предмета.")
                    continue

                teacher_name = str(row.get("Преподаватель", "")).strip()
                color = str(row.get("Цвет", "")).strip()

                # Поиск через репозиторий
                existing_sub = await self.repo.get_subject_by_name(user_id, subject_name)

                if existing_sub:
                    existing_sub.teacher_name = teacher_name if teacher_name else existing_sub.teacher_name
                    existing_sub.color = color if color else existing_sub.color
                    subject_id = existing_sub.subject_id
                    import_logs.append(f"Строка {row_num} (Предметы): Обновлен существующий предмет '{subject_name}'.")
                else:
                    new_sub = Subject(user_id=user_id, subject_name=subject_name, teacher_name=teacher_name, color=color or "#3b82f6")
                    self.repo.add(new_sub)
                    await self.repo.flush()  # Вытаскиваем сгенерированный базой ID
                    subject_id = new_sub.subject_id
                    subjects_imported += 1

                subject_name_to_id[subject_name] = subject_id

        # Синхронизируем маппинг со всеми предметами пользователя из БД
        all_user_subjects = await self.repo.get_subjects_by_user(user_id)
        for s in all_user_subjects:
            if s.subject_name not in subject_name_to_id:
                subject_name_to_id[s.subject_name] = s.subject_id

        # 3. Обработка импорта оценок (Grades)
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
                if sorted_date_str := graded_at_str:
                    try:
                        parsed_date = pd.to_datetime(sorted_date_str).to_pydatetime()
                    except Exception:
                        import_logs.append(f"Строка {row_num} (Оценки): Некорректный формат даты. Взята текущая дата.")

                # Проверка дубликатов через репозиторий
                existing_grade = await self.repo.get_grade_by_attributes(associated_subject_id, grade_value, description)

                if existing_grade:
                    existing_grade.graded_at = parsed_date
                    import_logs.append(f"Строка {row_num} (Оценки): Обновлена дата существующей оценки.")
                else:
                    self.repo.add(Grade(subject_id=associated_subject_id, grade_value=grade_value, graded_at=parsed_date, description=description))
                    grades_imported += 1

        # 4. Обработка импорта заданий (Assignments)
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

                # Проверка дубликатов заданий через репозиторий
                existing_assign = await self.repo.get_assignment_by_title(associated_subject_id, title)

                if existing_assign:
                    existing_assign.due_datetime = parsed_deadline if parsed_deadline else existing_assign.due_datetime
                    import_logs.append(f"Строка {row_num} (Задания): Обновлен дедлайн для существующего задания '{title}'.")
                else:
                    self.repo.add(Assignment(subject_id=associated_subject_id, title=title, due_datetime=parsed_deadline))
                    assignments_imported += 1

        # Единый коммит на всю операцию импорта (Unit of Work)
        await self.repo.commit()

        return {
            "status": "success",
            "imported_subjects": subjects_imported,
            "imported_grades": grades_imported,
            "imported_assignments": assignments_imported,
            "logs": import_logs
        }