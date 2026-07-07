import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Subject } from '../../types/subject'

interface SubjectTableProps {
  subjects: Subject[]
  deletingSubjectId?: number | null
  onEdit: (subject: Subject) => void
  onDelete: (subject: Subject) => void
}

export function SubjectTable({ subjects, deletingSubjectId, onEdit, onDelete }: SubjectTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  return (
    <div className="subjects-table-wrap">
      <table className="subjects-table">
        <thead>
          <tr>
            <th aria-label="Отступ" />
            <th>Предмет</th>
            <th>Оценка</th>
            <th>Преподаватель</th>
            <th>Дата окончания</th>
            <th aria-label="Действия" />
            <th aria-label="Отступ" />
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => {
            const isMenuOpen = openMenuId === subject.subject_id
            const isDeleting = deletingSubjectId === subject.subject_id
            const averageGrade = subject.average_grade && subject.average_grade > 0 ? subject.average_grade : '-'

            return (
              <tr key={subject.subject_id}>
                <td />
                <td>
                  <Link className="subjects-table__subject" to={`/subjects/${subject.subject_id}`}>
                    <span className="subjects-table__badge">{subject.subject_name.slice(0, 1).toUpperCase()}</span>
                    <span>{subject.subject_name}</span>
                  </Link>
                </td>
                <td className="subjects-table__grade">{averageGrade}</td>
                <td>{subject.teacher_name}</td>
                <td>01.01.2027</td>
                <td>
                  <div className="subjects-table__actions">
                    <button
                      className="subjects-table__menu"
                      type="button"
                      aria-label="Действия"
                      aria-expanded={isMenuOpen}
                      onClick={() => setOpenMenuId(isMenuOpen ? null : subject.subject_id)}
                    >
                      ...
                    </button>

                    {isMenuOpen && (
                      <div className="subjects-actions-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null)
                            onEdit(subject)
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => {
                            setOpenMenuId(null)
                            onDelete(subject)
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

          {subjects.length === 0 && (
            <tr>
              <td />
              <td colSpan={5}>
                <div className="subjects-empty">Предметы пока не добавлены</div>
              </td>
              <td />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
