import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || '',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const isPublicAuthRequest =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/me')

    if (
      status === 401 &&
      !isPublicAuthRequest &&
      window.location.pathname !== '/login'
    ) {
      window.dispatchEvent(new Event('auth:required'))
    }

    return Promise.reject(error)
  },
)

export async function requestWithCsrf(method, url, data) {
  const { data: csrf } = await api.get('/api/auth/csrf')
  return api.request({
    method,
    url,
    data,
    headers: {
      'X-XSRF-TOKEN': csrf.token,
    },
  })
}
