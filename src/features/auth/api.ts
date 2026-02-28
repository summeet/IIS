import apiClient from '../../api/client'

type RegisterPayload = {
  username: string
  email: string
  password: string
  role?: 'user'
}

type RegisterResponse = {
  message: string
  user_id: string
  user: {
    _id: string
    username: string
    email: string
    role: string
    access_token: string
    access_token_exp: string
    refresh_token_exp: string
    refresh_token: string
    created_at: string
    updated_at: string
  }
}

type LoginPayload = {
  email: string
  password: string
}

type LoginResponse = {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    _id: string
    username: string
    email: string
    role: string
    access_token: string
    access_token_exp: string
    refresh_token_exp: string
    refresh_token: string
  }
}

export async function registerUser(payload: RegisterPayload) {
  const response = await apiClient.post<RegisterResponse>('/auth/register', {
    ...payload,
    role: payload.role ?? 'user',
  })
  return response.data
}

export async function loginUser(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}

type LogoutResponse = {
  message: string
  user_id: string
}

export async function logoutUser() {
  const response = await apiClient.post<LogoutResponse>('/auth/logout')
  return response.data
}

export function persistAuthTokens(data: LoginResponse | RegisterResponse) {
  if (typeof window === 'undefined') return

  const accessToken =
    'access_token' in data ? data.access_token : data.user.access_token
  const refreshToken =
    'refresh_token' in data ? data.refresh_token : data.user.refresh_token

  window.sessionStorage.setItem('accessToken', accessToken)
  window.sessionStorage.setItem('refreshToken', refreshToken)
  const user = 'user' in data ? data.user : null
  const userForStorage = user
    ? {
        _id: user._id,
        name: (user as { name?: string }).name,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    : null
  window.sessionStorage.setItem('authUser', JSON.stringify(userForStorage))
  window.localStorage.setItem('authUser', JSON.stringify(userForStorage))
}

