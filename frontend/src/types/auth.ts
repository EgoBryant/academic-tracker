export interface RegisterPayload {
  full_name: string
  email: string
  password: string
}

export interface User {
  user_id: number
  full_name: string
  email: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}
