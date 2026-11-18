import { api, requestWithCsrf } from './api'

export async function getEmployees() {
  const { data } = await api.get('/api/employees')
  return data
}

export async function getEmployee(id) {
  const { data } = await api.get(`/api/employees/${encodeURIComponent(id)}`)
  return data
}

export async function searchEmployees(keyword) {
  const { data } = await api.get('/api/employees/search', {
    params: { keyword },
  })
  return data
}

export async function createEmployee(employee) {
  const { data } = await requestWithCsrf('post', '/api/employees', employee)
  return data
}

export async function updateEmployee(id, employee) {
  const { data } = await requestWithCsrf(
    'put',
    `/api/employees/${encodeURIComponent(id)}`,
    employee,
  )
  return data
}

export async function deleteEmployee(id) {
  await requestWithCsrf('delete', `/api/employees/${encodeURIComponent(id)}`)
}
