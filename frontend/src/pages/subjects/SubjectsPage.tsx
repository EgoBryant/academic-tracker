import { useState } from 'react'
import { SubjectForm } from '../../components/subjects/SubjectForm'
import { SubjectTable } from '../../components/subjects/SubjectTable'
import { mockSubjects } from '../../data/mockSubjects'

export function SubjectsPage() {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)

  return (
    <section className="subjects-page">
      <div className="subjects-panel">
        <header className="subjects-panel__header">
          <div>
            <h1>Предметы</h1>
            <p>Список академических предметов и оценок</p>
          </div>
          <button
            className="subjects-add-button"
            type="button"
            onClick={() => setCreateModalOpen(true)}
          >
            <span>+</span>
            <span>Добавить предмет</span>
          </button>
        </header>

        <SubjectTable subjects={mockSubjects} />

        <footer className="subjects-panel__footer">
          <div className="subjects-file-actions">
            <button className="subjects-file-button" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3v5h5" />
                <path d="M6 21h12a1 1 0 0 0 1-1V8l-5-5H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z" />
                <path d="M12 11v6M9 14l3 3 3-3" />
              </svg>
              <span>Импорт</span>
            </button>
            <button className="subjects-file-button" type="button">
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

      {isCreateModalOpen && <SubjectForm onClose={() => setCreateModalOpen(false)} />}
    </section>
  )
}
