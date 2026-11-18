import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './auth/AuthContext.jsx'
import { useAuth } from './auth/useAuth'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import DashboardPage from './pages/DashboardPage'
import EmployeeFormPage from './pages/EmployeeFormPage'

function AccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb] px-5">
      <section className="soft-shadow w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-indigo-600">Access restricted</p>
        <h1 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-slate-900">Insufficient permissions</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your account role does not allow access to this page. API authorization is still enforced by the server.
        </p>
        <Link to="/dashboard" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-700">
          Return to dashboard
        </Link>
      </section>
    </main>
  )
}

function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f7fb]">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <span className="spinner text-indigo-600" />
        Connecting to your workspace…
      </div>
    </main>
  )
}

function ProtectedRoute({ children, requiredRoles }) {
  const { user, loading, hasAnyRole } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (requiredRoles && !hasAnyRole(requiredRoles)) return <AccessDenied />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRoles={['USER', 'ADMIN']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute requiredRoles={['USER', 'ADMIN']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/employees/new" element={<ProtectedRoute requiredRoles={['ADMIN']}><EmployeeFormPage mode="create" /></ProtectedRoute>} />
      <Route path="/employees/:id/edit" element={<ProtectedRoute requiredRoles={['ADMIN']}><EmployeeFormPage mode="edit" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}