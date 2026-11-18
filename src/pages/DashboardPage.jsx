import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiEdit2,
  FiEye,
  FiFilePlus,
  FiHelpCircle,
  FiLogOut,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { BrandMark } from '../components/Brand'
import { deleteEmployee, getEmployee, getEmployees, searchEmployees } from '../services/employeeService'
import EmployeeFormPage from './EmployeeFormPage'
import { getErrorMessage } from '../utils'

function PageLoader({ label = 'Loading your workspace…' }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
      <span className="spinner text-indigo-600" />
      {label}
    </div>
  )
}

function StatusNotice({ children }) {
  if (!children) return null
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700" role="alert">
      <FiHelpCircle size={18} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function EmployeeDetails({ employee, onClose }) {
  if (!employee) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-details-title"
        className="fade-in w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Employee profile</p>
            <h2 id="employee-details-title" className="font-display mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
              {employee.firstName} {employee.lastName}
            </h2>
          </div>
          <button onClick={onClose} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close employee details">
            <FiX size={18} />
          </button>
        </div>
        <dl className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <dt className="text-sm text-slate-500">Employee ID</dt>
            <dd className="font-mono text-sm font-semibold text-slate-800">{employee.id}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <dt className="text-sm text-slate-500">First name</dt>
            <dd className="text-sm font-semibold text-slate-800">{employee.firstName}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <dt className="text-sm text-slate-500">Last name</dt>
            <dd className="text-sm font-semibold text-slate-800">{employee.lastName}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-slate-500">Email</dt>
            <dd className="break-all text-right text-sm font-semibold text-slate-800">{employee.email}</dd>
          </div>
        </dl>
        <button onClick={onClose} className="mt-7 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
          Done
        </button>
      </section>
    </div>
  )
}

function EmployeeTable({ employees, canManageEmployees, onDelete, onEdit, onView, deletingId }) {
  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center px-5 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><FiUsers size={25} /></span>
        <h3 className="font-display mt-4 text-base font-extrabold text-slate-900">No employees found</h3>
        <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
          Try a different search or add your first employee to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="border-y border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <th className="px-6 py-3.5">ID</th>
            <th className="px-4 py-3.5">First name</th>
            <th className="px-4 py-3.5">Last name</th>
            <th className="px-4 py-3.5">Email</th>
            <th className="px-6 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <tr key={employee.id} className="group transition hover:bg-indigo-50/30">
              <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">#{employee.id}</td>
              <td className="px-4 py-4 text-sm font-semibold text-slate-800">{employee.firstName}</td>
              <td className="px-4 py-4 text-sm font-semibold text-slate-800">{employee.lastName}</td>
              <td className="px-4 py-4">
                <a className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-indigo-600" href={`mailto:${employee.email}`}>
                  <FiMail size={14} className="shrink-0 text-slate-400" />
                  {employee.email}
                </a>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onView(employee.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-indigo-600"
                    aria-label={`View ${employee.firstName} ${employee.lastName}`}
                  >
                    <FiEye size={15} /> <span className="hidden xl:inline">View</span>
                  </button>
                  {canManageEmployees && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEdit(employee.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-indigo-600"
                        aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                      >
                        <FiEdit2 size={14} /> <span className="hidden xl:inline">Edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(employee)}
                        disabled={deletingId === employee.id}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                        aria-label={`Delete ${employee.firstName} ${employee.lastName}`}
                      >
                        {deletingId === employee.id ? <span className="spinner size-3.5" /> : <FiTrash2 size={14} />}
                        <span className="hidden xl:inline">Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DashboardPage() {
  const { user, roles, canManageEmployees, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [successNotice, setSuccessNotice] = useState('')
  const [employeeForm, setEmployeeForm] = useState(null)
  const loadRequestId = useRef(0)
  const notice = location.state?.notice
  const roleLabel = roles.length > 0 ? roles.join(', ') : 'No roles assigned'

  const loadEmployees = useCallback(async (term = '') => {
    const requestId = ++loadRequestId.current
    setLoading(true)
    setError('')
    try {
      const results = term.trim()
        ? await searchEmployees(term.trim())
        : await getEmployees()
      if (requestId !== loadRequestId.current) return
      setEmployees(Array.isArray(results) ? results : [])
      if (!term.trim()) setTotalEmployees(Array.isArray(results) ? results.length : 0)
      setActiveSearch(term.trim())
    } catch (requestError) {
      if (requestId !== loadRequestId.current) return
      setError(getErrorMessage(requestError, 'Could not load employees. Please try again.'))
    } finally {
      if (requestId === loadRequestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const requestId = ++loadRequestId.current
    getEmployees()
      .then((results) => {
        if (!active || requestId !== loadRequestId.current) return
        setEmployees(Array.isArray(results) ? results : [])
        setTotalEmployees(Array.isArray(results) ? results.length : 0)
        setActiveSearch('')
      })
      .catch((requestError) => {
        if (active && requestId === loadRequestId.current) {
          setError(getErrorMessage(requestError, 'Could not load employees. Please try again.'))
        }
      })
      .finally(() => {
        if (active && requestId === loadRequestId.current) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleDelete(employee) {
    const confirmed = window.confirm(`Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(employee.id)
    setError('')
    try {
      await deleteEmployee(employee.id)
      setTotalEmployees((total) => Math.max(0, total - 1))
      setSuccessNotice(`${employee.firstName} ${employee.lastName} was deleted.`)
      await loadEmployees(activeSearch)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not delete this employee. Please try again.'))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleEmployeeSaved(action) {
    setEmployeeForm(null)
    setSearch('')
    setSuccessNotice(action === 'created' ? 'Employee added to your directory.' : 'Employee details updated.')
    await loadEmployees('')
  }

  async function handleView(id) {
    setViewLoading(true)
    setError('')
    try {
      const employee = await getEmployee(id)
      setSelectedEmployee(employee)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not load this employee. Please try again.'))
    } finally {
      setViewLoading(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Could not sign out. Please try again.'))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col border-r border-slate-200/80 bg-white px-5 py-6 lg:flex">
        <Link to="/dashboard" aria-label="PeopleDesk home" className="mb-10 px-2"><BrandMark /></Link>
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        <Link to="/employees" aria-current="page" className="flex items-center gap-3 rounded-xl bg-indigo-50 px-3 py-3 text-sm font-bold text-indigo-700">
          <span className="grid size-8 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm"><FiUsers size={16} /></span>
          Employees
          <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-600">{totalEmployees}</span>
        </Link>
        <div className="mt-auto rounded-2xl bg-slate-50 p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm"><FiShield size={17} /></div>
          <p className="text-xs font-bold text-slate-800">Your workspace</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">Secure access to your employee directory.</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Session protected
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden"><BrandMark /></div>
            <div className="hidden items-center gap-2 text-sm text-slate-400 lg:flex">
              <span>Workspace</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-700">Employees</span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-5 text-slate-800">{user?.username}</p>
                <p className="text-[11px] font-medium text-slate-400">{roleLabel}</p>
              </div>
              <div className="grid size-9 place-items-center rounded-full bg-indigo-100 text-xs font-extrabold uppercase text-indigo-700">
                {user?.username?.slice(0, 2) || 'U'}
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
              >
                {loggingOut ? <span className="spinner size-3.5" /> : <FiLogOut size={15} />}
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
          <nav className="flex items-center border-t border-slate-100 px-5 py-2 lg:hidden" aria-label="Main navigation">
            <Link to="/employees" aria-current="page" className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
              <FiUsers size={14} /> Employees
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-indigo-600">{totalEmployees}</span>
            </Link>
          </nav>
        </header>

        <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="fade-in">
            <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <FiBriefcase size={15} /> PEOPLE DIRECTORY
                </div>
                <h1 className="font-display text-3xl font-extrabold tracking-[-0.05em] text-slate-900 sm:text-[38px]">Employees</h1>
                <p className="mt-2 text-sm text-slate-500">Manage and keep track of the people on your team.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadEmployees(activeSearch)}
                  disabled={loading}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-50"
                >
                  <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="surface-shadow flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5">
                <div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FiUsers size={20} /></div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Total employees</p>
                  <p className="font-display mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{loading ? '—' : totalEmployees}</p>
                </div>
                <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Directory</span>
              </div>
              <div className="surface-shadow flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5">
                <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><FiCheck size={20} /></div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Access level</p>
                  <p className="font-display mt-1 text-lg font-extrabold tracking-tight text-slate-900">{roleLabel}</p>
                </div>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold ${canManageEmployees ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {canManageEmployees ? 'Manage access' : 'View only'}
                </span>
              </div>
            </div>

            <section className="soft-shadow overflow-hidden rounded-2xl border border-slate-100 bg-white">
              <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h2 className="font-display text-base font-extrabold text-slate-900">All employees</h2>
                  <p className="mt-1 text-xs text-slate-400">{activeSearch ? `Results for “${activeSearch}”` : 'A complete list of your employees'}</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <form
                    className="flex w-full gap-2 sm:max-w-[370px]"
                    onSubmit={(event) => {
                      event.preventDefault()
                      loadEmployees(search)
                    }}
                    role="search"
                  >
                    <label className="relative min-w-0 flex-1">
                      <span className="sr-only">Search employees</span>
                      <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                          const value = event.target.value
                          setSearch(value)
                          if (!value.trim() && activeSearch) loadEmployees('')
                        }}
                        placeholder="Search by name or email"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      />
                    </label>
                    <button type="submit" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white transition hover:bg-slate-700">
                      Search <FiArrowRight size={14} />
                    </button>
                  </form>
                  {canManageEmployees && (
                    <button
                      type="button"
                      onClick={() => setEmployeeForm({ mode: 'create' })}
                      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700"
                    >
                      <FiFilePlus size={16} /> Add Employee
                    </button>
                  )}
                </div>
              </div>
              {(notice || successNotice) && (
                <div className="mx-5 mt-1 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 sm:mx-6" role="status">
                  <FiCheck size={16} className="shrink-0" /> {successNotice || notice}
                </div>
              )}
              <div className="px-5 pt-4 sm:px-6"><StatusNotice>{error}</StatusNotice></div>
              {loading ? (
                <PageLoader label="Loading employees…" />
              ) : (
                <EmployeeTable
                  employees={employees}
                  canManageEmployees={canManageEmployees}
                  onDelete={handleDelete}
                  onEdit={(id) => setEmployeeForm({ mode: 'edit', id })}
                  onView={handleView}
                  deletingId={deletingId}
                />
              )}
              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <span>Showing <strong className="text-slate-600">{loading ? '—' : employees.length}</strong> {employees.length === 1 ? 'employee' : 'employees'}</span>
                <span className="inline-flex items-center gap-1.5"><FiShield size={14} className="text-emerald-600" /> Data is protected by your account</span>
              </div>
            </section>

            {!canManageEmployees && (
              <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                <FiShield size={14} /> Contact an administrator to add, edit, or remove employees.
              </div>
            )}
          </div>
        </main>
      </div>

      {viewLoading && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/20 backdrop-blur-[1px]" aria-label="Loading employee">
          <span className="spinner size-6 text-indigo-600" />
        </div>
      )}
      <EmployeeDetails employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
      {employeeForm && (
        <EmployeeFormPage
          mode={employeeForm.mode}
          id={employeeForm.id}
          modal
          onCancel={() => setEmployeeForm(null)}
          onSaved={handleEmployeeSaved}
        />
      )}
    </div>
  )
}
