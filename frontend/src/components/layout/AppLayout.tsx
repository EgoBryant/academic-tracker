import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme')

    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
      localStorage.setItem('app-theme', nextTheme)
      return nextTheme
    })
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <Sidebar theme={theme} onToggleTheme={toggleTheme} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
