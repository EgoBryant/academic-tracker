import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../../api/errorMessage'
import { createSubject, deleteSubject, getSubjects, updateSubject } from '../../api/subjects'
import { ExportModal } from '../../components/export/ExportModal'
import { ImportModal } from '../../components/export/ImportModal'
import { SubjectForm } from '../../components/subjects/SubjectForm'
import { SubjectTable } from '../../components/subjects/SubjectTable'
import type { Subject, SubjectPayload } from '../../types/subject'
import { getAuthToken } from '../../utils/authStorage'

type SubjectModalMode = 'create' | 'edit'

const SUBJECTS_PER_PAGE = 10
const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте ещё раз.'
const SUBJECT_ERROR_MESSAGES = {
  unauthorized: 'Нужно войти в аккаунт, чтобы работать с предметами.',
  server: 'Ошибка сервера. Попробуйте повторить запрос позже.',
  fallback: DEFAULT_ERROR_MESSAGE,
}

export function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [currentPage, setCurrentPage] = useState(1)
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

  const totalPages = Math.max(1, Math.ceil(subjects.length / SUBJECTS_PER_PAGE))
  const pageStart = (currentPage - 1) * SUBJECTS_PER_PAGE
  const visibleSubjects = subjects.slice(pageStart, pageStart + SUBJECTS_PER_PAGE)

  useEffect(() => {
    loadSubjects()
  }, [])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const loadSubjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const loadedSubjects = await getSubjects()
      setSubjects(loadedSubjects)
    } catch (error) {
      setError(getApiErrorMessage(error, SUBJECT_ERROR_MESSAGES))
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
        setCurrentPage(Math.max(1, Math.ceil((subjects.length + 1) / SUBJECTS_PER_PAGE)))
      }

      setSubjectModalOpen(false)
      setSelectedSubject(null)
    } catch (error) {
      setFormError(getApiErrorMessage(error, SUBJECT_ERROR_MESSAGES))
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
    } catch (error) {
      setError(getApiErrorMessage(error, SUBJECT_ERROR_MESSAGES))
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
            subjects={visibleSubjects}
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
            <button
              className="subjects-page-arrow"
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1

              return (
                <button
                  className={`subjects-page-number${pageNumber === currentPage ? ' subjects-page-number--active' : ''}`}
                  type="button"
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              className="subjects-page-arrow"
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
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
      {isImportModalOpen && <ImportModal onClose={() => setImportModalOpen(false)} onImported={loadSubjects} />}
      {isExportModalOpen && <ExportModal onClose={() => setExportModalOpen(false)} />}
    </section>
  )
}
