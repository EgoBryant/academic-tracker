interface ExportModalProps {
  onClose: () => void
}

export function ExportModal({ onClose }: ExportModalProps) {
  return (
    <div className="export-modal" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <button className="export-modal__backdrop" type="button" aria-label="Закрыть" onClick={onClose} />

      <div className="export-modal__card">
        <header className="export-modal__header">
          <div className="export-modal__title">
            <span className="export-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 3v4M17 3v4M4.5 9h15" />
                <rect x="4.5" y="5" width="15" height="15" rx="1.5" />
                <path d="M8 13h3M8 16h5" />
              </svg>
            </span>
            <h2 id="export-modal-title">Экспорт данных</h2>
          </div>

          <button className="export-modal__close" type="button" aria-label="Закрыть" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form
          className="export-modal__form"
          onSubmit={(event) => {
            event.preventDefault()
            onClose()
          }}
        >
          <div className="export-modal__body">
            <fieldset className="export-modal__fieldset">
              <legend>Формат</legend>

              <div className="export-modal__formats">
                <label className="export-modal__format">
                  <input type="radio" name="export-format" defaultChecked />
                  <span>XLSX</span>
                </label>

                <label className="export-modal__format">
                  <input type="radio" name="export-format" />
                  <span>CSV</span>
                </label>
              </div>
            </fieldset>
          </div>

          <footer className="export-modal__footer">
            <button className="export-modal__cancel" type="button" onClick={onClose}>
              Отмена
            </button>
            <button className="export-modal__submit" type="submit">
              Экспортировать
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
