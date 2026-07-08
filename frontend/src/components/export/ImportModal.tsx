import { useState } from 'react'
import type { FormEvent } from 'react'
import { AxiosError } from 'axios'
import { importUserData } from '../../api/dataTransfer'
import type { ImportResult } from '../../types/dataTransfer'

interface ImportModalProps {
  onClose: () => void
  onImported?: () => void
}

const DEFAULT_ERROR_MESSAGE = 'Не удалось импортировать данные. Попробуйте ещё раз.'

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

    try {
      setSubmitting(true)
      setError(null)
      const importResult = await importUserData(selectedFile)
      setResult(importResult)
      onImported?.()
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
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

        <form className="subject-modal__form" onSubmit={handleSubmit}>
          <div className="subject-modal__body">
            <label className="subject-modal__field">
              <span>Файл</span>
              <input
                type="file"
                accept=".xlsx,.zip,.csv"
                disabled={isSubmitting}
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <p className="subject-modal__hint">Можно загрузить Excel-файл или ZIP/CSV-архив с данными.</p>

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

function getRequestErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return 'Нужно войти в аккаунт, чтобы импортировать данные.'
    }

    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }
  }

  return DEFAULT_ERROR_MESSAGE
}
