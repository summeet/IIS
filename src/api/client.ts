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
  if(error.response.status === 401) {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('uploadReports')
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('theme')
    window.sessionStorage.removeItem('isAuthenticated')
    window.location.href = '/login'
  }
  return Promise.reject(error)
})
export default apiClient

