import { apiClient } from './client'
import type { LoginResponse, RegisterPayload, User } from '../types/auth'

export async function registerUser(payload: RegisterPayload) {
  const { data } = await apiClient.post<User>('/auth/register', payload)
  return data
}

export async function loginUser(email: string, password: string) {
  const formData = new URLSearchParams()
  formData.set('username', email)
  formData.set('password', password)
  formData.set('grant_type', 'password')

  const { data } = await apiClient.post<LoginResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  return data
}
