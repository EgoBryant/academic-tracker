import { useEffect, useMemo, useState } from 'react'
import { createAssignment, deleteAssignment, getAssignments, updateAssignment } from '../../api/assignments'
import { getApiErrorMessage } from '../../api/errorMessage'
import { getSubjects } from '../../api/subjects'
import { AssignmentModal } from '../../components/calendar/AssignmentModal'
import type { AssignmentModalMode } from '../../components/calendar/AssignmentModal'
import type { Assignment, AssignmentPayload } from '../../types/assignment'
import type { Subject } from '../../types/subject'
import { buildCalendarDays, getAssignmentTone, parseDateTime } from '../../utils/calendar'

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
    } catch (error) {
      setError(getCalendarErrorMessage(error))
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
    } catch (error) {
      setModalError(getCalendarErrorMessage(error))
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
    } catch (error) {
      setModalError(getCalendarErrorMessage(error))
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

function getCalendarErrorMessage(error: unknown) {
  return getApiErrorMessage(error, {
    unauthorized: 'Нужно войти в аккаунт, чтобы работать с мероприятиями.',
    server: 'Ошибка сервера. Попробуйте позже.',
    fallback: DEFAULT_ERROR_MESSAGE,
  })
}
