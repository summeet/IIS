import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://sportsx-6.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.sessionStorage.getItem('accessToken')
    if (token) {
      config.headers = config.headers ?? ({} as typeof config.headers)
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

apiClient.interceptors.response.use((response) => {
  return response
}, (error) => {
  if (error?.response?.status === 401) {
    const url = String(error.config?.url ?? '')
    const isAuthEndpoint =
      /auth\/(login|register|logout)/.test(url)
    // Don't clear session or redirect on 401 from login/register (bad credentials) or logout
    if (!isAuthEndpoint) {
      window.localStorage.removeItem('token')
      window.localStorage.removeItem('uploadReports')
      window.localStorage.removeItem('user')
      window.localStorage.removeItem('authUser')
      window.sessionStorage.removeItem('accessToken')
      window.sessionStorage.removeItem('refreshToken')
      window.sessionStorage.removeItem('authUser')
      window.sessionStorage.removeItem('isAuthenticated')
      window.dispatchEvent(new CustomEvent('auth:redirectToLogin'))
    }
  }
  return Promise.reject(error)
})
export default apiClient

