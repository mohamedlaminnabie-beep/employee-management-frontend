import { api, requestWithCsrf } from './api'

export async function register(credentials) {
  const { data } = await requestWithCsrf('post', '/api/auth/register', credentials)
  return data
}

export async function login(credentials) {
  const { data } = await requestWithCsrf('post', '/api/auth/login', credentials)
  return data
}

export async function logout() {
  await requestWithCsrf('post', '/api/auth/logout')
}

export async function getCurrentUser() {
  const { data } = await api.get('/api/auth/me')
  return data
}
