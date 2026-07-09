const AUTH_TOKEN_KEY = 'auth-token'
const AUTH_USER_KEY = 'auth-user'

interface StoredUser {
  user_id: number
  full_name: string
  email: string
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string, remember = true) {
  const targetStorage = remember ? localStorage : sessionStorage
  const staleStorage = remember ? sessionStorage : localStorage

  staleStorage.removeItem(AUTH_TOKEN_KEY)
  staleStorage.removeItem(AUTH_USER_KEY)
  targetStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  sessionStorage.removeItem(AUTH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_USER_KEY)
}

export function getAuthUser() {
  const user = localStorage.getItem(AUTH_USER_KEY) ?? sessionStorage.getItem(AUTH_USER_KEY)

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user) as StoredUser
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    sessionStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function setAuthUser(user: StoredUser, remember = true) {
  const targetStorage = remember ? localStorage : sessionStorage
  const staleStorage = remember ? sessionStorage : localStorage

  staleStorage.removeItem(AUTH_TOKEN_KEY)
  staleStorage.removeItem(AUTH_USER_KEY)
  targetStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}
