import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { CalendarPage } from './pages/calendar/CalendarPage'
import { SubjectDetailsPage } from './pages/subjects/SubjectDetailsPage'
import { SubjectsPage } from './pages/subjects/SubjectsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/subjects" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailsPage />} />
      </Route>
    </Routes>
  )
}

export default App
