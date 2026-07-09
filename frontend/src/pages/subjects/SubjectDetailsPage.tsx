import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { createGrade, deleteGrade, getGrades, updateGrade } from '../../api/grades'
import { getSubjects } from '../../api/subjects'
import { ExportModal } from '../../components/export/ExportModal'
import { ImportModal } from '../../components/export/ImportModal'
import type { Grade, GradePayload } from '../../types/grade'
import type { Subject } from '../../types/subject'

type GradeModalMode = 'create' | 'edit'

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте ещё раз.'

export function SubjectDetailsPage() {
  const { id } = useParams()
  const subjectId = Number(id)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<GradeModalMode>('create')
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null)
  const [isGradeModalOpen, setGradeModalOpen] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [deletingGradeId, setDeletingGradeId] = useState<number | null>(null)
  const [isExportModalOpen, setExportModalOpen] = useState(false)
  const [isImportModalOpen, setImportModalOpen] = useState(false)

  useEffect(() => {
    loadGrades()
  }, [subjectId])

  const loadGrades = async () => {
    if (!subjectId) {
      setError('Некорректный ID предмета.')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const [loadedGrades, loadedSubjects] = await Promise.all([getGrades(subjectId), getSubjects()])
      setSubject(loadedSubjects.find((loadedSubject) => loadedSubject.subject_id === subjectId) ?? null)
      setGrades(loadedGrades)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedGrade(null)
    setFormError(null)
    setGradeModalOpen(true)
  }

  const openEditModal = (grade: Grade) => {
    setModalMode('edit')
    setSelectedGrade(grade)
    setFormError(null)
    setGradeModalOpen(true)
  }

  const closeGradeModal = () => {
    if (isSubmitting) {
      return
    }

    setGradeModalOpen(false)
    setSelectedGrade(null)
    setFormError(null)
  }

  const handleSubmitGrade = async (payload: GradePayload) => {
    try {
      setSubmitting(true)
      setFormError(null)

      if (modalMode === 'edit' && selectedGrade) {
        const updatedGrade = await updateGrade(selectedGrade.grade_id, payload)
        setGrades((currentGrades) =>
          currentGrades.map((grade) => (grade.grade_id === updatedGrade.grade_id ? updatedGrade : grade)),
        )
      } else {
        const createdGrade = await createGrade(subjectId, payload)
        setGrades((currentGrades) => [...currentGrades, createdGrade])
      }

      setGradeModalOpen(false)
      setSelectedGrade(null)
    } catch (requestError) {
      setFormError(getRequestErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGrade = async (grade: Grade) => {
    try {
      setDeletingGradeId(grade.grade_id)
      setError(null)
      await deleteGrade(grade.grade_id)
      setGrades((currentGrades) => currentGrades.filter((currentGrade) => currentGrade.grade_id !== grade.grade_id))
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setDeletingGradeId(null)
    }
  }

  return (
    <section className="subjects-page">
      <div className="subjects-panel">
        <header className="subjects-panel__header">
          <div>
            <h1>{subject?.subject_name ?? 'Предмет'}</h1>
            <p>Оценки по предмету {subject?.subject_name ?? id}</p>
          </div>

          <button className="subjects-add-button" type="button" onClick={openCreateModal}>
            <span>+</span>
            <span>Добавить оценку</span>
          </button>
        </header>

        {isLoading ? (
          <div className="subjects-state">Загрузка оценок...</div>
        ) : (
          <GradesTable
            grades={grades}
            deletingGradeId={deletingGradeId}
            onEdit={openEditModal}
            onDelete={handleDeleteGrade}
          />
        )}

        {error && (
          <div className="subjects-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadGrades}>
              Повторить
            </button>
          </div>
        )}

        <footer className="subjects-panel__footer">
          <div className="subjects-file-actions">
            <button className="subjects-file-button" type="button" onClick={() => setImportModalOpen(true)}>
              Импорт
            </button>
            <button className="subjects-file-button" type="button" onClick={() => setExportModalOpen(true)}>
              Экспорт
            </button>
          </div>

          <nav className="subjects-pagination" aria-label="Пагинация оценок">
            <button className="subjects-page-arrow" type="button" disabled>
              ‹
            </button>
            <button className="subjects-page-number subjects-page-number--active" type="button">
              1
            </button>
            <button className="subjects-page-number" type="button">
              2
            </button>
            <button className="subjects-page-number" type="button">
              3
            </button>
            <button className="subjects-page-arrow" type="button">
              ›
            </button>
          </nav>
        </footer>
      </div>

      {isGradeModalOpen && (
        <GradeForm
          initialGrade={selectedGrade}
          isSubmitting={isSubmitting}
          error={formError}
          onClose={closeGradeModal}
          onSubmit={handleSubmitGrade}
        />
      )}
      {isImportModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} onImported={loadGrades} />}
      {isExportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} />}
    </section>
  )
}

interface GradesTableProps {
  grades: Grade[]
  deletingGradeId: number | null
  onEdit: (grade: Grade) => void
  onDelete: (grade: Grade) => void
}

function GradesTable({ grades, deletingGradeId, onEdit, onDelete }: GradesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  return (
    <div className="subjects-table-wrap">
      <table className="subjects-table">
        <thead>
          <tr>
            <th aria-label="Отступ" />
            <th>Оценка</th>
            <th>Описание</th>
            <th>Дата</th>
            <th aria-label="Действия" />
            <th aria-label="Отступ" />
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => {
            const isMenuOpen = openMenuId === grade.grade_id
            const isDeleting = deletingGradeId === grade.grade_id

            return (
              <tr key={grade.grade_id}>
                <td />
                <td className="subjects-table__grade">{grade.grade_value}</td>
                <td>{grade.description || '-'}</td>
                <td>{formatDate(grade.graded_at)}</td>
                <td>
                  <div className="subjects-table__actions">
                    <button
                      className="subjects-table__menu"
                      type="button"
                      aria-label="Действия оценки"
                      aria-expanded={isMenuOpen}
                      onClick={() => setOpenMenuId(isMenuOpen ? null : grade.grade_id)}
                    >
                      ...
                    </button>

                    {isMenuOpen && (
                      <div className="subjects-actions-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null)
                            onEdit(grade)
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => {
                            setOpenMenuId(null)
                            onDelete(grade)
                          }}
                        >
                          {isDeleting ? 'Удаление...' : 'Удалить'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td />
              </tr>
            )
          })}

          {grades.length === 0 && (
            <tr>
              <td />
              <td colSpan={4}>
                <div className="subjects-empty">Оценки пока не добавлены</div>
              </td>
              <td />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

interface GradeFormProps {
  initialGrade?: Grade | null
  isSubmitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: GradePayload) => Promise<void> | void
}

function GradeForm({ initialGrade, isSubmitting = false, error, onClose, onSubmit }: GradeFormProps) {
  const isEditing = Boolean(initialGrade)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = {
      grade_value: String(formData.get('grade_value') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      graded_at: String(formData.get('graded_at') ?? '').trim(),
    }
    const nextError = validateGradeForm(payload)

    if (nextError) {
      setValidationError(nextError)
      return
    }

    setValidationError(null)
    await onSubmit(payload)
  }

  return (
    <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="grade-modal-title">
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
            <h2 id="grade-modal-title">{isEditing ? 'Редактирование оценки' : 'Добавление оценки'}</h2>
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
              <span>Оценка</span>
              <input name="grade_value" defaultValue={initialGrade?.grade_value ?? ''} disabled={isSubmitting} />
            </label>

            <label className="subject-modal__field">
              <span>Описание</span>
              <input name="description" defaultValue={initialGrade?.description ?? ''} disabled={isSubmitting} />
            </label>

            <label className="subject-modal__field">
              <span>Дата</span>
              <input
                name="graded_at"
                type="date"
                defaultValue={initialGrade?.graded_at ?? getTodayDate()}
                disabled={isSubmitting}
              />
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

function validateGradeForm(payload: GradePayload) {
  if (!payload.grade_value) {
    return 'Введите оценку.'
  }

  if (!['2', '3', '4', '5'].includes(payload.grade_value)) {
    return 'Оценка должна быть 2, 3, 4 или 5.'
  }

  if (!payload.graded_at) {
    return 'Выберите дату оценки.'
  }

  return null
}

function getRequestErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'Нужно войти в аккаунт, чтобы работать с оценками.'
    }

    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (error.response?.status && error.response.status >= 500) {
      return 'Ошибка сервера. Попробуйте позже.'
    }
  }

  return DEFAULT_ERROR_MESSAGE
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-')

  if (!year || !month || !day) {
    return date
  }

  return `${day}.${month}.${year}`
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}
