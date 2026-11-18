import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../services/authService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    let active = true
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const handleAuthRequired = () => {
      setUser(null)
      setLoading(false)
      navigateRef.current('/login', { replace: true })
    }
    window.addEventListener('auth:required', handleAuthRequired)

    return () => {
      active = false
      window.removeEventListener('auth:required', handleAuthRequired)
    }
  }, [])

  const signIn = useCallback(async (credentials) => {
    const authenticatedUser = await loginRequest(credentials)
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const signOut = useCallback(async () => {
    await logoutRequest()
    setUser(null)
  }, [])

  const roles = useMemo(() => (
    Array.isArray(user?.roles)
      ? user.roles
        .filter((role) => typeof role === 'string')
        .map((role) => role.trim().toUpperCase().replace(/^ROLE_/, ''))
      : []
  ), [user])
  const hasRole = useCallback((role) => (
    roles.includes(role.trim().toUpperCase().replace(/^ROLE_/, ''))
  ), [roles])
  const hasAnyRole = useCallback((requiredRoles) => (
    requiredRoles.some((role) => hasRole(role))
  ), [hasRole])

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signOut,
    roles,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('ADMIN'),
    canViewEmployees: hasAnyRole(['USER', 'ADMIN']),
    canManageEmployees: hasRole('ADMIN'),
  }), [user, loading, signIn, signOut, roles, hasRole, hasAnyRole])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
