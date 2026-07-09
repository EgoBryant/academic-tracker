import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Assignment, AssignmentPayload } from '../../types/assignment'
import type { Subject } from '../../types/subject'
import { buildDueDateTime, formatDateInput, formatTimeInput, parseDateTime } from '../../utils/calendar'

export type AssignmentModalMode = 'create' | 'view'

interface AssignmentModalProps {
  mode: AssignmentModalMode
  assignment: Assignment | null
  subjects: Subject[]
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (payload: AssignmentPayload) => Promise<void>
  onDelete: (assignment: Assignment) => Promise<void>
}

export function AssignmentModal({
  mode,
  assignment,
  subjects,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onDelete,
}: AssignmentModalProps) {
  const initialDateTime = assignment ? parseDateTime(assignment.due_datetime) : new Date()
  const initialSubjectId = assignment?.subject_id ?? subjects[0]?.subject_id ?? ''
  const isViewing = mode === 'view' && assignment
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const date = String(formData.get('date') ?? '')
    const time = String(formData.get('time') ?? '')
    const subjectId = Number(formData.get('subject_id'))
    const payload = {
      title: String(formData.get('title') ?? '').trim(),
      subject_id: subjectId,
      due_datetime: buildDueDateTime(date, time),
    }
    const nextError = validateAssignmentForm(payload.title, subjectId, date, time)

    if (nextError) {
      setValidationError(nextError)
      return
    }

    setValidationError(null)
    await onSubmit(payload)
  }

  return (
    <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title">
      <button className="subject-modal__backdrop" type="button" aria-label="Закрыть форму" onClick={onClose} />

      <section className="subject-modal__card">
        <header className="subject-modal__header">
          <div className="subject-modal__title">
            <span className="subject-modal__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 2v4M16 2v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              </svg>
            </span>
            <h2 id="assignment-modal-title">{isViewing ? 'Просмотр мероприятия' : 'Добавление мероприятия'}</h2>
          </div>
          <button className="subject-modal__close" type="button" onClick={onClose} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form className="subject-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="subject-modal__body">
            <label className="subject-modal__field">
              <span>Название</span>
              <input name="title" defaultValue={assignment?.title ?? ''} disabled={isSubmitting} />
            </label>

            <label className="subject-modal__field">
              <span>Предмет</span>
              <select name="subject_id" defaultValue={initialSubjectId} disabled={isSubmitting || subjects.length === 0}>
                {subjects.length === 0 ? (
                  <option value="">Предметы не найдены</option>
                ) : (
                  subjects.map((subject) => (
                    <option value={subject.subject_id} key={subject.subject_id}>
                      {subject.subject_name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="subject-modal__row">
              <label className="subject-modal__field">
                <span>Дата</span>
                <input name="date" type="date" defaultValue={formatDateInput(initialDateTime)} disabled={isSubmitting} />
              </label>

              <label className="subject-modal__field">
                <span>Время</span>
                <input name="time" type="time" defaultValue={formatTimeInput(initialDateTime)} disabled={isSubmitting} />
              </label>
            </div>

            {(validationError || error) && <p className="subject-modal__error">{validationError ?? error}</p>}
          </div>

          <footer className="subject-modal__footer">
            {isViewing ? (
              <button
                className="subject-modal__delete"
                type="button"
                onClick={() => onDelete(assignment)}
                disabled={isSubmitting}
              >
                Удалить
              </button>
            ) : (
              <button className="subject-modal__cancel" type="button" onClick={onClose} disabled={isSubmitting}>
                Отмена
              </button>
            )}
            <button className="subject-modal__submit" type="submit" disabled={isSubmitting || subjects.length === 0}>
              {isSubmitting ? 'Сохранение...' : isViewing ? 'Изменить' : 'Добавить'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function validateAssignmentForm(title: string, subjectId: number, date: string, time: string) {
  if (title.length < 2) {
    return 'Название мероприятия должно быть не короче 2 символов.'
  }

  if (!subjectId) {
    return 'Выберите предмет для мероприятия.'
  }

  if (!date) {
    return 'Выберите дату мероприятия.'
  }

  if (!time) {
    return 'Выберите время мероприятия.'
  }

  return null
}
