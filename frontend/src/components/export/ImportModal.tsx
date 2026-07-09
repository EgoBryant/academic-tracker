import { useState } from 'react'
import type { FormEvent } from 'react'
import { importUserData } from '../../api/dataTransfer'
import { getApiErrorMessage } from '../../api/errorMessage'
import type { ImportResult } from '../../types/dataTransfer'

interface ImportModalProps {
  onClose: () => void
  onImported?: () => void
}

const DEFAULT_ERROR_MESSAGE = 'Не удалось импортировать данные. Попробуйте ещё раз.'
const EMPTY_IMPORT_MESSAGE =
  'Данные не найдены. Для Excel нужны листы Subjects, Grades и Assignments с правильными заголовками.'
const IMPORT_ERROR_MESSAGES = {
  unauthorized: 'Нужно войти в аккаунт, чтобы импортировать данные.',
  notFound: 'Эндпоинт импорта не найден. Проверьте, что backend запущен с актуальной версией API.',
  validation: 'Неправильный формат Excel или структура файла.',
  server: 'Ошибка сервера при импорте. Попробуйте позже.',
  fallback: DEFAULT_ERROR_MESSAGE,
}

export function ImportModal({ onClose, onImported }: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedFile) {
      setError('Выберите файл .xlsx, .zip или .csv.')
      return
    }

    const validationError = validateImportFile(selectedFile)

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      const importResult = await importUserData(selectedFile)

      if (isEmptyImportResult(importResult)) {
        setResult(null)
        setError(EMPTY_IMPORT_MESSAGE)
        return
      }

      setResult(importResult)
      onImported?.()
    } catch (error) {
      setError(getApiErrorMessage(error, IMPORT_ERROR_MESSAGES))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
      <button className="subject-modal__backdrop" type="button" aria-label="Закрыть" onClick={onClose} />

      <section className="subject-modal__card">
        <header className="subject-modal__header">
          <div className="subject-modal__title">
            <span className="subject-modal__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3v5h5" />
                <path d="M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z" />
                <path d="M12 11v6M9 14l3 3 3-3" />
              </svg>
            </span>
            <h2 id="import-modal-title">Импорт данных</h2>
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
              <span>Файл</span>
              <input
                type="file"
                accept=".xlsx,.zip,.csv"
                disabled={isSubmitting}
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null)
                  setError(null)
                  setResult(null)
                }}
              />
            </label>

            <p className="subject-modal__hint">
              XLSX должен содержать листы Subjects, Grades и Assignments. ZIP должен содержать CSV-файлы экспорта.
            </p>

            {error && <p className="subject-modal__error">{error}</p>}

            {result && (
              <div className="subject-modal__success" role="status">
                <strong>Импорт завершён</strong>
                <span>Предметы: {result.imported_subjects}</span>
                <span>Оценки: {result.imported_grades}</span>
                <span>Мероприятия: {result.imported_assignments}</span>
              </div>
            )}
          </div>

          <footer className="subject-modal__footer">
            <button className="subject-modal__cancel" type="button" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </button>
            <button className="subject-modal__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Импорт...' : 'Импортировать'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function validateImportFile(file: File) {
  const fileName = file.name.toLowerCase()
  const isAllowedFile = fileName.endsWith('.xlsx') || fileName.endsWith('.zip') || fileName.endsWith('.csv')

  if (!isAllowedFile) {
    return 'Неправильный формат файла. Загрузите .xlsx, .zip или .csv.'
  }

  return null
}

function isEmptyImportResult(result: ImportResult) {
  return (
    result.imported_subjects === 0 &&
    result.imported_grades === 0 &&
    result.imported_assignments === 0 &&
    result.logs.length === 0
  )
}
