import { useParams } from 'react-router-dom'

export function SubjectDetailsPage() {
  const { id } = useParams()

  return (
    <section className="page">
      <header>
        <h1 className="page__title">Детали предмета</h1>
        <p className="page__description">ID предмета: {id}</p>
      </header>
    </section>
  )
}
