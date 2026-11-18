import { useState } from 'react'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import { AuthShell } from '../components/Brand'
import { useAuth } from '../auth/useAuth'
import { getErrorMessage, validatePassword, validateUsername } from '../utils'

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100'

function Field({ id, label, icon: Icon, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">{error}</p>}
    </div>
  )
}

function PasswordInput({ id, value, onChange, autoComplete, maxLength }) {
  const [visible, setVisible] = useState(false)
  return (
    <>
      <FiLock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        name="password"
        className={`${inputClass} pl-11 pr-12`}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        {visible ? <FiEyeOff size={17} /> : <FiEye size={17} />}
      </button>
    </>
  )
}

function FormAlert({ children }) {
  if (!children) return null
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
      {children}
    </div>
  )
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? <><span className="spinner" /> Please wait…</> : <>{children}<FiArrowRight size={17} /></>}
    </button>
  )
}

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const notice = location.state?.notice

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setServerError('')
    setLoading(true)
    try {
      await signIn({ username: username.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(getErrorMessage(error, 'We could not sign you in. Check your username and password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="login">
      <div className="space-y-5">
        {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
        <FormAlert>{serverError}</FormAlert>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Field id="username" label="Username" icon={FiUser} error={errors.username}>
            <input
              id="username"
              name="username"
              className={`${inputClass} pl-11`}
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={50}
              required
            />
          </Field>
          <Field id="password" label="Password" icon={FiLock} error={errors.password}>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <SubmitButton loading={loading}>Sign in</SubmitButton>
        </form>
        <p className="pt-1 text-center text-sm text-slate-500">
          New to PeopleDesk?{' '}
          <Link className="font-bold text-indigo-600 hover:text-indigo-700" to="/register">Create an account</Link>
        </p>
      </div>
    </AuthShell>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {
      username: validateUsername(username),
      password: validatePassword(password, { registration: true }),
      confirmPassword: confirmPassword === password ? '' : 'Passwords do not match.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setServerError('')
    setLoading(true)
    try {
      await register({ username: username.trim(), password })
      navigate('/login', {
        replace: true,
        state: { notice: 'Account created. Sign in with your new credentials.' },
      })
    } catch (error) {
      setServerError(getErrorMessage(error, 'We could not create your account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="register">
      <div className="space-y-5">
        <FormAlert>{serverError}</FormAlert>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Field id="username" label="Username" icon={FiUser} error={errors.username}>
            <input
              id="username"
              name="username"
              className={`${inputClass} pl-11`}
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              minLength={3}
              maxLength={50}
              required
            />
          </Field>
          <Field id="password" label="Password" icon={FiLock} error={errors.password}>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              maxLength={92}
            />
          </Field>
          <p className="-mt-2 text-xs leading-5 text-slate-400">Use 6 to 92 characters for your password.</p>
          <Field id="confirm-password" label="Confirm password" icon={FiLock} error={errors.confirmPassword}>
            <input
              id="confirm-password"
              name="confirmPassword"
              className={`${inputClass} pl-11`}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              maxLength={92}
              required
            />
          </Field>
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </form>
        <p className="pt-1 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link className="font-bold text-indigo-600 hover:text-indigo-700" to="/login">Sign in</Link>
        </p>
      </div>
    </AuthShell>
  )
}
