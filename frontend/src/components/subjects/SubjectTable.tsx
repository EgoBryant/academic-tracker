import { Link } from 'react-router-dom'
import type { Subject } from '../../types/subject'

interface SubjectTableProps {
  subjects: Subject[]
}

export function SubjectTable({ subjects }: SubjectTableProps) {
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
          {subjects.map((subject) => (
            <tr key={subject.subject_id}>
              <td />
              <td>
                <Link className="subjects-table__subject" to={`/subjects/${subject.subject_id}`}>
                  <span className="subjects-table__badge">
                    {subject.subject_name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>{subject.subject_name}</span>
                </Link>
              </td>
              <td className="subjects-table__grade">
                {subject.average_grade > 0 ? subject.average_grade : '-'}
              </td>
              <td>{subject.teacher_name}</td>
              <td>01.01.2027</td>
              <td>
                <button className="subjects-table__menu" type="button" aria-label="Действия">
                  ...
                </button>
              </td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
