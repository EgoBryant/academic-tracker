import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { loginUser, registerUser } from '../../api/auth'
import { setAuthToken, setAuthUser } from '../../api/authToken'

export function RegisterPage() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isSubmitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('auth-theme')

    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
      localStorage.setItem('auth-theme', nextTheme)
      return nextTheme
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const fullName = String(formData.get('full_name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const validationError = validateRegisterForm(fullName, email, password)

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSubmitting(true)
      setError(null)
      await registerUser({ full_name: fullName, email, password })
      const loginResponse = await loginUser(email, password)
      setAuthToken(loginResponse.access_token)
      setAuthUser(loginResponse.user)
      navigate('/subjects')
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page" data-theme={theme}>
      <header className="login-header">
        <Link className="login-brand" to="/login" aria-label="Зачётка">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 2.8 7.7 12 12.4l9.2-4.7L12 3Z" />
            <path d="M5.8 10v5.3L12 18.5l6.2-3.2V10" />
            <path d="M21.2 7.7v5.5" />
          </svg>
          <span>Зачётка</span>
        </Link>
        <button className="login-theme-toggle" type="button" onClick={toggleTheme} aria-label="Сменить тему">
          {theme === 'light' ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 12.8A8 8 0 1 1 11.2 3a6.4 6.4 0 0 0 9.8 9.8Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
            </svg>
          )}
        </button>
      </header>

      <section className="login-main" aria-label="Регистрация">
        <div className="login-bg login-bg--blue" />
        <div className="login-bg login-bg--gold" />

        <div className="login-auth login-auth--register">
          <div className="login-tabs" role="tablist" aria-label="Auth tabs">
            <Link className="login-tab" to="/login">
              Авторизация
            </Link>
            <button className="login-tab login-tab--active" type="button">
              Регистрация
            </button>
          </div>

          <form className="login-card login-card--register" onSubmit={handleSubmit} noValidate>
            <label className="login-field">
              <span>ФИО</span>
              <span className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.25" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                <input name="full_name" placeholder="Ваше имя" autoComplete="name" />
              </span>
            </label>

            <label className="login-field">
              <span>EMAIL</span>
              <span className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16v12H4V6Z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                <input name="email" type="email" placeholder="ivan@example.ru" autoComplete="email" />
              </span>
            </label>

            <label className="login-field">
              <span>Пароль</span>
              <span className="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="5" y="10" width="14" height="10" rx="1.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <path d="M12 14.5v2" />
                </svg>
                <input name="password" type="password" placeholder="••••••••" autoComplete="new-password" />
              </span>
            </label>

            {error && <p className="login-error">{error}</p>}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Создание...' : 'Создать аккаунт'}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      <footer className="login-footer">© 2026</footer>
    </main>
  )
}

function validateRegisterForm(fullName: string, email: string, password: string) {
  if (fullName.length < 2) {
    return 'Введите ФИО минимум из 2 символов.'
  }

  if (!isValidEmail(email)) {
    return 'Введите корректный email.'
  }

  if (password.length < 8) {
    return 'Пароль должен быть не короче 8 символов.'
  }

  return null
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 400 || error.response?.status === 409) {
      return typeof error.response.data?.detail === 'string'
        ? error.response.data.detail
        : 'Проверьте данные регистрации.'
    }

    if (typeof error.response?.data?.detail === 'string') {
      return error.response.data.detail
    }

    if (error.response?.status && error.response.status >= 500) {
      return 'Ошибка сервера. Попробуйте позже.'
    }
  }

  return 'Не удалось создать аккаунт. Проверьте данные и попробуйте ещё раз.'
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
