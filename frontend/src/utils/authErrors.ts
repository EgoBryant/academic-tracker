import { getApiErrorMessage } from '../api/errorMessage'

export function getLoginErrorMessage(error: unknown) {
  return getApiErrorMessage(error, {
    unauthorized: 'Неверный email или пароль.',
    server: 'Ошибка сервера. Попробуйте позже.',
    fallback: 'Неверные данные для входа.',
  })
}

export function getRegisterErrorMessage(error: unknown) {
  return getApiErrorMessage(error, {
    validation: 'Проверьте данные регистрации.',
    server: 'Ошибка сервера. Попробуйте позже.',
    fallback: 'Не удалось создать аккаунт.',
  })
}
