import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createAssignment, deleteAssignment, getAssignments, updateAssignment } from '../../api/assignments'
import { getApiErrorMessage } from '../../api/errorMessage'
import { getSubjects } from '../../api/subjects'
import type { Assignment, AssignmentPayload } from '../../types/assignment'
import type { Subject } from '../../types/subject'

type AssignmentModalMode = 'create' | 'view'

interface CalendarDay {
  date: Date
  dateKey: string
  muted: boolean
  today: boolean
  assignments: Assignment[]
}

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

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте ещё раз.'
const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export function CalendarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<AssignmentModalMode>('create')
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadCalendarData()
  }, [])

  const visibleDate = useMemo(() => {
    const firstAssignment = assignments[0]
    return firstAssignment ? parseDateTime(firstAssignment.due_datetime) : new Date()
  }, [assignments])

  const calendarDays = useMemo(() => buildCalendarDays(visibleDate, assignments), [assignments, visibleDate])

  const loadCalendarData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [loadedAssignments, loadedSubjects] = await Promise.all([getAssignments(), getSubjects()])
      setAssignments(loadedAssignments)
      setSubjects(loadedSubjects)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedAssignment(null)
    setModalError(null)
    setModalOpen(true)
  }

  const openViewModal = (assignment: Assignment) => {
    setModalMode('view')
    setSelectedAssignment(assignment)
    setModalError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (isSubmitting) {
      return
    }

    setModalOpen(false)
    setSelectedAssignment(null)
    setModalError(null)
  }

  const handleSubmitAssignment = async (payload: AssignmentPayload) => {
    try {
      setSubmitting(true)
      setModalError(null)

      if (modalMode === 'view' && selectedAssignment) {
        const updatedAssignment = await updateAssignment(selectedAssignment.assignment_id, payload)
        setAssignments((currentAssignments) =>
          currentAssignments.map((assignment) =>
            assignment.assignment_id === updatedAssignment.assignment_id ? updatedAssignment : assignment,
          ),
        )
      } else {
        const createdAssignment = await createAssignment(payload)
        setAssignments((currentAssignments) => [...currentAssignments, createdAssignment])
      }

      setModalOpen(false)
      setSelectedAssignment(null)
    } catch (requestError) {
      setModalError(getRequestErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAssignment = async (assignment: Assignment) => {
    try {
      setSubmitting(true)
      setModalError(null)
      await deleteAssignment(assignment.assignment_id)
      setAssignments((currentAssignments) =>
        currentAssignments.filter((currentAssignment) => currentAssignment.assignment_id !== assignment.assignment_id),
      )
      setModalOpen(false)
      setSelectedAssignment(null)
    } catch (requestError) {
      setModalError(getRequestErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="calendar-page">
      <header className="calendar-header">
        <h1>Календарь</h1>
        <p>Отслеживание мероприятий и дедлайнов по учёбе</p>
      </header>

      {isLoading ? (
        <div className="subjects-state">Загрузка календаря...</div>
      ) : (
        <div className="calendar-board" aria-label="Календарь дедлайнов">
          <div className="calendar-weekdays">
            {weekDays.map((weekDay) => (
              <div className="calendar-weekday" key={weekDay}>
                {weekDay}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {calendarDays.map((calendarDay) => (
              <article
                className={`calendar-day${calendarDay.muted ? ' calendar-day--muted' : ''}`}
                key={calendarDay.dateKey}
              >
                <div className="calendar-day__top">
                  <span className="calendar-day__number">{calendarDay.date.getDate()}</span>
                  {calendarDay.today && <span className="calendar-today">сегодня</span>}
                </div>

                {calendarDay.assignments.length > 0 && (
                  <div className="calendar-events">
                    {calendarDay.assignments.map((assignment, assignmentIndex) => (
                      <button
                        className={`calendar-event calendar-event--${getAssignmentTone(assignmentIndex)}`}
                        type="button"
                        key={assignment.assignment_id}
                        onClick={() => openViewModal(assignment)}
                      >
                        {assignment.title}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="subjects-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadCalendarData}>
            Повторить
          </button>
        </div>
      )}

      <button className="calendar-fab" type="button" aria-label="Добавить мероприятие" onClick={openCreateModal}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {isModalOpen && (
        <AssignmentModal
          mode={modalMode}
          assignment={selectedAssignment}
          subjects={subjects}
          isSubmitting={isSubmitting}
          error={modalError}
          onClose={closeModal}
          onSubmit={handleSubmitAssignment}
          onDelete={handleDeleteAssignment}
        />
      )}
    </section>
  )
}

function AssignmentModal({
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

function buildCalendarDays(visibleDate: Date, assignments: Assignment[]) {
  const year = visibleDate.getFullYear()
  const month = visibleDate.getMonth()
  const firstMonthDay = new Date(year, month, 1)
  const firstGridDay = new Date(firstMonthDay)
  const mondayOffset = (firstMonthDay.getDay() + 6) % 7
  firstGridDay.setDate(firstMonthDay.getDate() - mondayOffset)

  const todayKey = getDateKey(new Date())
  const assignmentsByDate = assignments.reduce<Record<string, Assignment[]>>((result, assignment) => {
    const dateKey = getDateKey(parseDateTime(assignment.due_datetime))
    result[dateKey] = [...(result[dateKey] ?? []), assignment]
    return result
  }, {})

  return Array.from({ length: 35 }, (_, index): CalendarDay => {
    const date = new Date(firstGridDay)
    date.setDate(firstGridDay.getDate() + index)
    const dateKey = getDateKey(date)

    return {
      date,
      dateKey,
      muted: date.getMonth() !== month,
      today: dateKey === todayKey,
      assignments: assignmentsByDate[dateKey] ?? [],
    }
  })
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

function getDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateTime(value: string) {
  const normalizedValue = value.includes('T') ? value : value.replace(' ', 'T')
  const parsedDate = new Date(normalizedValue)

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date()
  }

  return parsedDate
}

function formatDateInput(date: Date) {
  return getDateKey(date)
}

function formatTimeInput(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function buildDueDateTime(date: string, time: string) {
  return `${date}T${time}:00`
}

function getAssignmentTone(index: number) {
  const tones = ['yellow', 'blue', 'red'] as const
  return tones[index % tones.length]
}

function getRequestErrorMessage(error: unknown) {
  return getApiErrorMessage(error, {
    unauthorized: 'Нужно войти в аккаунт, чтобы работать с мероприятиями.',
    server: 'Ошибка сервера. Попробуйте позже.',
    fallback: DEFAULT_ERROR_MESSAGE,
  })
}
