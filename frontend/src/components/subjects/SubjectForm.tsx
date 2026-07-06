interface SubjectFormProps {
  onClose: () => void
}

export function SubjectForm({ onClose }: SubjectFormProps) {
  return (
    <div className="subject-modal" role="dialog" aria-modal="true" aria-labelledby="subject-modal-title">
      <button
        className="subject-modal__backdrop"
        type="button"
        aria-label="Закрыть форму"
        onClick={onClose}
      />

      <section className="subject-modal__card">
        <header className="subject-modal__header">
          <div className="subject-modal__title">
            <span className="subject-modal__icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 3v4M17 3v4M5 6h14v14H5V6Z" />
                <path d="M8 11h8M8 15h5" />
              </svg>
            </span>
            <h2 id="subject-modal-title">Добавление предмета</h2>
          </div>
          <button className="subject-modal__close" type="button" onClick={onClose} aria-label="Закрыть">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <form className="subject-modal__form">
          <label className="subject-modal__field">
            <span>Название</span>
            <input name="subject_name" />
          </label>

          <label className="subject-modal__field">
            <span>Преподаватель</span>
            <input name="teacher_name" />
          </label>

          <label className="subject-modal__field">
            <span>Цвет</span>
            <input className="subject-modal__color" name="color" defaultValue="#1C63FF" aria-label="Цвет предмета" />
          </label>

          <label className="subject-modal__field">
            <span>Дата окончания</span>
            <input name="end_date" defaultValue="01/01/2026" />
          </label>
        </form>

        <footer className="subject-modal__footer">
          <button className="subject-modal__cancel" type="button" onClick={onClose}>
            Отмена
          </button>
          <button className="subject-modal__submit" type="button" onClick={onClose}>
            Добавить
          </button>
        </footer>
      </section>
    </div>
  )
}
