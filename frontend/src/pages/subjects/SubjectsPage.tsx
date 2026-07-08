import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { createSubject, deleteSubject, getSubjects, updateSubject } from '../../api/subjects'
import { getAuthToken } from '../../api/authToken'
import { ExportModal } from '../../components/export/ExportModal'
import { ImportModal } from '../../components/export/ImportModal'
import { SubjectForm } from '../../components/subjects/SubjectForm'
import { SubjectTable } from '../../components/subjects/SubjectTable'
import type { Subject, SubjectPayload } from '../../types/subject'

type SubjectModalMode = 'create' | 'edit'

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте ещё раз.'

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<SubjectModalMode>('create')
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [isSubjectModalOpen, setSubjectModalOpen] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [deletingSubjectId, setDeletingSubjectId] = useState<number | null>(null)
  const [isExportModalOpen, setExportModalOpen] = useState(false)
  const [isImportModalOpen, setImportModalOpen] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const loadedSubjects = await getSubjects()
      setSubjects(loadedSubjects)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setSelectedSubject(null)
    setFormError(null)
    setSubjectModalOpen(true)
  }

  const openEditModal = (subject: Subject) => {
    setModalMode('edit')
    setSelectedSubject(subject)
    setFormError(null)
    setSubjectModalOpen(true)
  }

  const closeSubjectModal = () => {
    if (isSubmitting) {
      return
    }

    setSubjectModalOpen(false)
    setSelectedSubject(null)
    setFormError(null)
  }

  const handleSubmitSubject = async (payload: SubjectPayload) => {
    try {
      setSubmitting(true)
      setFormError(null)

      if (modalMode === 'edit' && selectedSubject) {
        const updatedSubject = await updateSubject(selectedSubject.subject_id, payload)
        setSubjects((currentSubjects) =>
          currentSubjects.map((subject) =>
            subject.subject_id === updatedSubject.subject_id ? updatedSubject : subject,
          ),
        )
      } else {
        const createdSubject = await createSubject(payload)
        setSubjects((currentSubjects) => [...currentSubjects, createdSubject])
      }

      setSubjectModalOpen(false)
      setSelectedSubject(null)
    } catch (requestError) {
      setFormError(getRequestErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSubject = async (subject: Subject) => {
    try {
      setDeletingSubjectId(subject.subject_id)
      setError(null)
      await deleteSubject(subject.subject_id)
      setSubjects((currentSubjects) =>
        currentSubjects.filter((currentSubject) => currentSubject.subject_id !== subject.subject_id),
      )
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setDeletingSubjectId(null)
    }
  }

  return (
    <section className="subjects-page">
      <div className="subjects-panel">
        <header className="subjects-panel__header">
          <div>
            <h1>Предметы</h1>
            <p>Список академических предметов и оценок</p>
          </div>
          <button className="subjects-add-button" type="button" onClick={openCreateModal} disabled={!getAuthToken()}>
            <span>+</span>
            <span>Добавить предмет</span>
          </button>
        </header>

        {isLoading ? (
          <div className="subjects-state">Загрузка предметов...</div>
        ) : (
          <SubjectTable
            subjects={subjects}
            deletingSubjectId={deletingSubjectId}
            onEdit={openEditModal}
            onDelete={handleDeleteSubject}
          />
        )}

        {error && (
          <div className="subjects-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadSubjects}>
              Повторить
            </button>
          </div>
        )}

        <footer className="subjects-panel__footer">
          <div className="subjects-file-actions">
            <button className="subjects-file-button" type="button" onClick={() => setImportModalOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3v5h5" />
                <path d="M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z" />
                <path d="M12 11v6M9 14l3 3 3-3" />
              </svg>
              <span>Импорт</span>
            </button>
            <button className="subjects-file-button" type="button" onClick={() => setExportModalOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3v5h5" />
                <path d="M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z" />
                <path d="M12 17v-6M9 14l3-3 3 3" />
              </svg>
              <span>Экспорт</span>
            </button>
          </div>

          <nav className="subjects-pagination" aria-label="Пагинация">
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

      {isSubjectModalOpen && (
        <SubjectForm
          initialSubject={selectedSubject}
          isSubmitting={isSubmitting}
          error={formError}
          onClose={closeSubjectModal}
          onSubmit={handleSubmitSubject}
        />
      )}
      {isImportModalOpen && (
        <ImportModal onClose={() => setImportModalOpen(false)} onImported={loadSubjects} />
      )}
      {isExportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} />}
    </section>
  )
}

function getRequestErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'Нужно войти в аккаунт, чтобы работать с предметами.'
    }

    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }
  }

  return DEFAULT_ERROR_MESSAGE
}
