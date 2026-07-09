import { useState } from 'react'
import type { FormEvent } from 'react'
import { exportUserData } from '../../api/dataTransfer'
import { getApiErrorMessage } from '../../api/errorMessage'
import type { ExportFormat } from '../../types/dataTransfer'

interface ExportModalProps {
  onClose: () => void
}

const DEFAULT_ERROR_MESSAGE = 'Не удалось экспортировать данные. Попробуйте ещё раз.'
const EXPORT_ERROR_MESSAGES = {
  unauthorized: 'Нужно войти в аккаунт, чтобы экспортировать данные.',
  server: 'Ошибка сервера при экспорте. Попробуйте позже.',
  fallback: DEFAULT_ERROR_MESSAGE,
}

export function ExportModal({ onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)
      setError(null)
      const { file, fileName } = await exportUserData(format)
      downloadFile(file, fileName)
      onClose()
    } catch (error) {
      setError(getApiErrorMessage(error, EXPORT_ERROR_MESSAGES))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <button className="subject-modal__backdrop" type="button" aria-label="Закрыть" onClick={onClose} />

      <section className="subject-modal__card">
        <header className="subject-modal__header">
          <div className="subject-modal__title">
            <span className="subject-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M14 3v5h5" />
                <path d="M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z" />
                <path d="M12 17v-6M9 14l3-3 3 3" />
              </svg>
            </span>
            <h2 id="export-modal-title">Экспорт данных</h2>
          </div>

          <button className="subject-modal__close" type="button" aria-label="Закрыть" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form className="subject-modal__form" onSubmit={handleSubmit}>
          <div className="subject-modal__body">
            <fieldset className="subject-modal__fieldset">
              <legend>Формат</legend>

              <div className="subject-modal__formats">
                <label className="subject-modal__format">
                  <input
                    type="radio"
                    name="export-format"
                    value="xlsx"
                    checked={format === 'xlsx'}
                    onChange={() => setFormat('xlsx')}
                    disabled={isSubmitting}
                  />
                  <span>XLSX</span>
                </label>

                <label className="subject-modal__format">
                  <input
                    type="radio"
                    name="export-format"
                    value="csv"
                    checked={format === 'csv'}
                    onChange={() => setFormat('csv')}
                    disabled={isSubmitting}
                  />
                  <span>CSV</span>
                </label>
              </div>
            </fieldset>

            {error && <p className="subject-modal__error">{error}</p>}
          </div>

          <footer className="subject-modal__footer">
            <button className="subject-modal__cancel" type="button" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </button>
            <button className="subject-modal__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Экспорт...' : 'Экспортировать'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function downloadFile(file: Blob, fileName: string) {
  const fileUrl = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(fileUrl)
}
