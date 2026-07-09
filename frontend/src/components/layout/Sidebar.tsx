import { NavLink, useNavigate } from 'react-router-dom'
import { getAuthUser, removeAuthToken } from '../../api/authToken'

interface SidebarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export function Sidebar({ theme, onToggleTheme }: SidebarProps) {
  const navigate = useNavigate()
  const user = getAuthUser()

  const handleLogout = () => {
    removeAuthToken()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <h1 className="sidebar__brand">Зачётка</h1>
        <div className="sidebar__user">{user?.full_name ?? 'Студент'}</div>
      </div>

      <nav className="sidebar__nav" aria-label="Основная навигация">
        <NavLink
          className={({ isActive }) =>
            isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
          }
          to="/subjects"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6.5h6.5v11H4v-11Z" />
            <path d="M13.5 6.5H20v11h-6.5v-11Z" />
            <path d="M10.5 8.5h3" />
          </svg>
          <span>Предметы</span>
        </NavLink>

        <NavLink
          className={({ isActive }) =>
            isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
          }
          to="/calendar"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 3v4M17 3v4M4.5 9h15" />
            <rect x="4.5" y="5" width="15" height="15" rx="1.5" />
          </svg>
          <span>Календарь</span>
        </NavLink>
      </nav>

      <div className="sidebar__actions">
        <button className="sidebar__action" type="button" onClick={onToggleTheme}>
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
          <span>{theme === 'light' ? 'Темная тема' : 'Светлая тема'}</span>
        </button>

        <button className="sidebar__action" type="button" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 21H5.5A1.5 1.5 0 0 1 4 19.5v-15A1.5 1.5 0 0 1 5.5 3H9" />
            <path d="M15 17l5-5-5-5M20 12H9" />
          </svg>
          <span>Выход из аккаунта</span>
        </button>
      </div>
    </aside>
  )
}
