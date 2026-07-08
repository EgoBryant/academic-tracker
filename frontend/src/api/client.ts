import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { getAuthToken } from './authToken'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

export const dataClient = axios.create({
  baseURL: import.meta.env.VITE_DATA_API_URL ?? '',
})

const addAuthHeader = (config: InternalAxiosRequestConfig) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}

apiClient.interceptors.request.use(addAuthHeader)
dataClient.interceptors.request.use(addAuthHeader)
