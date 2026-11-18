export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const responseMessage = error.response?.data?.message
    ?? error.response?.data?.detail
    ?? error.response?.data?.error
  if (responseMessage) return responseMessage
  if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
  if (error.response?.status === 403) return 'Your account does not have permission to perform this action.'
  return fallback
}

export function validateUsername(username) {
  const value = username.trim()
  if (value.length < 3) return 'Username must be at least 3 characters.'
  if (value.length > 50) return 'Username must be 50 characters or fewer.'
  return ''
}

export function validatePassword(password, { registration = false } = {}) {
  if (password.length < 6) return 'Password must be at least 6 characters.'
  if (registration && password.length > 92) return 'Password must be 92 characters or fewer.'
  return ''
}

export function validateEmployee(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = 'First name is required.'
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  return errors
}