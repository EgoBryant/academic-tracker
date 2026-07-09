import { AxiosError } from 'axios'

interface ApiErrorMessages {
  unauthorized?: string
  notFound?: string
  validation?: string
  server?: string
  fallback: string
}

export function getApiErrorMessage(error: unknown, messages: ApiErrorMessages) {
  if (error instanceof AxiosError) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return messages.unauthorized ?? messages.fallback
    }

    if (error.response?.status === 404 && messages.notFound) {
      return messages.notFound
    }

    if ((error.response?.status === 400 || error.response?.status === 409 || error.response?.status === 422) && messages.validation) {
      return getResponseDetail(error.response.data?.detail) ?? messages.validation
    }

    if (error.response?.status && error.response.status >= 500) {
      return messages.server ?? messages.fallback
    }

    const detail = getResponseDetail(error.response?.data?.detail)

    if (detail) {
      return detail
    }
  }

  return messages.fallback
}

function getResponseDetail(detail: unknown) {
  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return 'Проверьте введённые данные и попробуйте ещё раз.'
  }

  return null
}
