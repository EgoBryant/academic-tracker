import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Subject, SubjectPayload } from '../../types/subject'

interface SubjectFormProps {
  initialSubject?: Subject | null
  isSubmitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: SubjectPayload) => Promise<void> | void
}

export function SubjectForm({ initialSubject, isSubmitting = false, error, onClose, onSubmit }: SubjectFormProps) {
  const isEditing = Boolean(initialSubject)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const subjectName = String(formData.get('subject_name') ?? '').trim()
    const teacherName = String(formData.get('teacher_name') ?? '').trim()
    const color = String(formData.get('color') ?? '').trim() || '#1C63FF'
    const nextError = validateSubjectForm(subjectName, teacherName, color)

    if (nextError) {
      setValidationError(nextError)
      return
    }

    setValidationError(null)

    await onSubmit({
      subject_name: subjectName,
      teacher_name: teacherName,
      color,
    })
  }

  return (
    <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="subject-modal-title">
      <button className="subject-modal__backdrop" type="button" aria-label="Закрыть форму" onClick={onClose} />

      <section className="subject-modal__card">
        <header className="subject-modal__header">
          <div className="subject-modal__title">
            <span className="subject-modal__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 3v4M17 3v4M5 6h14v14H5V6Z" />
                <path d="M8 11h8M8 15h5" />
              </svg>
            </span>
            <h2 id="subject-modal-title">{isEditing ? 'Редактирование предмета' : 'Добавление предмета'}</h2>
          </div>
          <button className="subject-modal__close" type="button" onClick={onClose} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <form className="subject-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="subject-modal__body">
            <label className="subject-modal__field">
              <span>Название</span>
              <input name="subject_name" defaultValue={initialSubject?.subject_name ?? ''} disabled={isSubmitting} />
            </label>

            <label className="subject-modal__field">
              <span>Преподаватель</span>
              <input
                name="teacher_name"
                defaultValue={initialSubject?.teacher_name ?? ''}
                disabled={isSubmitting}
                placeholder="Иванов И.И."
              />
            </label>

            <label className="subject-modal__field">
              <span>Цвет</span>
              <input
                className="subject-modal__color"
                name="color"
                defaultValue={initialSubject?.color ?? '#1C63FF'}
                aria-label="Цвет предмета"
                disabled={isSubmitting}
              />
            </label>

            <label className="subject-modal__field">
              <span>Дата окончания</span>
              <input name="end_date" defaultValue="01/01/2026" disabled />
            </label>

            {(validationError || error) && <p className="subject-modal__error">{validationError ?? error}</p>}
          </div>

          <footer className="subject-modal__footer">
            <button className="subject-modal__cancel" type="button" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </button>
            <button className="subject-modal__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Добавить'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function validateSubjectForm(subjectName: string, teacherName: string, color: string) {
  if (subjectName.length < 2) {
    return 'Название предмета должно быть не короче 2 символов.'
  }

  if (teacherName.length < 3) {
    return 'Имя преподавателя должно быть не короче 3 символов.'
  }

  if (!/^[A-Za-zА-Яа-яЁё.\-\s]+$/.test(teacherName)) {
    return 'Имя преподавателя может содержать только буквы, пробелы, точки и дефисы.'
  }

  if (!/[A-Za-zА-Яа-яЁё]/.test(teacherName)) {
    return 'Укажите имя преподавателя.'
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return 'Цвет должен быть в формате #1C63FF.'
  }

  return null
}
