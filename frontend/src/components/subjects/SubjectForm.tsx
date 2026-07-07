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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const subjectName = String(formData.get('subject_name') ?? '').trim()
    const teacherName = String(formData.get('teacher_name') ?? '').trim()
    const color = String(formData.get('color') ?? '').trim()

    await onSubmit({
      subject_name: subjectName,
      teacher_name: teacherName,
      color: color || '#1C63FF',
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

        <form className="subject-modal__form" onSubmit={handleSubmit}>
          <div className="subject-modal__body">
            <label className="subject-modal__field">
              <span>Название</span>
              <input name="subject_name" defaultValue={initialSubject?.subject_name ?? ''} required />
            </label>

            <label className="subject-modal__field">
              <span>Преподаватель</span>
              <input name="teacher_name" defaultValue={initialSubject?.teacher_name ?? ''} required />
            </label>

            <label className="subject-modal__field">
              <span>Цвет</span>
              <input
                className="subject-modal__color"
                name="color"
                defaultValue={initialSubject?.color ?? '#1C63FF'}
                aria-label="Цвет предмета"
                required
              />
            </label>

            <label className="subject-modal__field">
              <span>Дата окончания</span>
              <input name="end_date" defaultValue="01/01/2026" disabled />
            </label>

            {error && <p className="subject-modal__error">{error}</p>}
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
