import { useEffect, useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiAtSign, FiCheck, FiUser } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createEmployee, getEmployee, updateEmployee } from '../services/employeeService'
import { getErrorMessage, validateEmployee } from '../utils'

const EMPTY_EMPLOYEE = { firstName: '', lastName: '', email: '' }
const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50'

function EmployeeField({ name, label, value, onChange, onBlur, error, icon: Icon, type = 'text', placeholder }) {
  const id = `employee-${name}`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${inputClass} pl-11 ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-50' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required
        />
      </div>
      {error && <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-rose-600" role="alert">{error}</p>}
    </div>
  )
}

export default function EmployeeFormPage({ mode, id: employeeId, modal = false, onCancel, onSaved }) {
  const isEditing = mode === 'edit'
  const { id: routeId } = useParams()
  const id = employeeId ?? routeId
  const navigate = useNavigate()
  const [values, setValues] = useState(EMPTY_EMPLOYEE)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!isEditing) return undefined

    let active = true
    getEmployee(id)
      .then((employee) => {
        if (active) {
          setValues({
            firstName: employee.firstName ?? '',
            lastName: employee.lastName ?? '',
            email: employee.email ?? '',
          })
        }
      })
      .catch((error) => {
        if (active) setServerError(getErrorMessage(error, 'Could not load this employee.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, isEditing])

  function updateField(event) {
    const { name, value } = event.target
    const updated = { ...values, [name]: value }
    setValues(updated)
    if (errors[name]) setErrors((current) => ({ ...current, [name]: validateEmployee(updated)[name] }))
  }

  function validateField(event) {
    const { name } = event.target
    setErrors((current) => ({ ...current, [name]: validateEmployee(values)[name] }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateEmployee(values)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    setSubmitting(true)
    setServerError('')
    const employee = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
    }
    try {
      if (isEditing) {
        await updateEmployee(id, employee)
      } else {
        await createEmployee(employee)
      }
      if (onSaved) {
        await onSaved(isEditing ? 'updated' : 'created')
      } else {
        navigate('/dashboard', {
          replace: true,
          state: { notice: isEditing ? 'Employee details updated.' : 'Employee added to your directory.' },
        })
      }
    } catch (error) {
      setServerError(getErrorMessage(error, 'Could not save this employee. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={modal
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]'
        : 'min-h-screen bg-[#f5f7fb] px-5 py-8 sm:px-8 lg:px-10 lg:py-10'}
      role={modal ? 'presentation' : undefined}
      onMouseDown={modal ? (event) => {
        if (event.target === event.currentTarget && !submitting) onCancel?.()
      } : undefined}
    >
      <div className={modal
        ? 'fade-in max-h-[calc(100vh-2rem)] w-full max-w-[620px] overflow-y-auto rounded-2xl bg-white shadow-2xl'
        : 'mx-auto max-w-[860px]'}
      role={modal ? 'dialog' : undefined}
      aria-modal={modal ? 'true' : undefined}
      aria-labelledby={modal ? 'employee-form-title' : undefined}>
        {!modal && (
          <Link to="/dashboard" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600">
            <FiArrowLeft size={16} /> Back to employees
          </Link>
        )}
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.17em] text-indigo-600">Employee directory</p>
          <h1 id={modal ? 'employee-form-title' : undefined} className="font-display text-3xl font-extrabold tracking-[-0.05em] text-slate-900">
            {isEditing ? 'Edit employee' : 'Add an employee'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isEditing ? 'Update the employee information below.' : 'Add someone new to your team directory.'}
          </p>
        </div>

        <section className={`${modal ? '' : 'soft-shadow border border-slate-100'} overflow-hidden rounded-2xl bg-white`}>
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm text-slate-500">
              <span className="spinner text-indigo-600" /> Loading employee…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 sm:px-8">
                <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FiUser size={18} /></span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Basic information</h2>
                  <p className="mt-0.5 text-xs text-slate-400">Fields marked required must be completed.</p>
                </div>
              </div>
              <form className="space-y-5 px-6 py-7 sm:px-8" onSubmit={handleSubmit} noValidate>
                {serverError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                    {serverError}
                  </div>
                )}
                <div className="grid gap-5 sm:grid-cols-2">
                  <EmployeeField
                    name="firstName"
                    label="First name"
                    value={values.firstName}
                    onChange={updateField}
                    onBlur={validateField}
                    error={errors.firstName}
                    icon={FiUser}
                    placeholder="e.g. Alex"
                  />
                  <EmployeeField
                    name="lastName"
                    label="Last name"
                    value={values.lastName}
                    onChange={updateField}
                    onBlur={validateField}
                    error={errors.lastName}
                    icon={FiUser}
                    placeholder="e.g. Morgan"
                  />
                </div>
                <EmployeeField
                  name="email"
                  label="Email address"
                  value={values.email}
                  onChange={updateField}
                  onBlur={validateField}
                  error={errors.email}
                  icon={FiAtSign}
                  type="email"
                  placeholder="alex@company.com"
                />
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  {modal ? (
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={submitting}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  ) : (
                    <Link to="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                      Cancel
                    </Link>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/15 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-65"
                  >
                    {submitting ? <span className="spinner" /> : <FiCheck size={16} />}
                    {submitting ? 'Saving…' : isEditing ? 'Save changes' : modal ? 'Save Employee' : 'Add employee'}
                    {!submitting && <FiArrowRight size={15} />}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
        <p className="mt-4 text-center text-xs text-slate-400">Only employee name and email details are collected.</p>
      </div>
    </div>
  )
}
