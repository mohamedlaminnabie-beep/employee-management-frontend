import { FiArrowUpRight, FiCheck, FiUsers } from 'react-icons/fi'

export function BrandMark({ light = false }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className={`grid size-10 place-items-center rounded-xl ${light ? 'bg-white/15 text-white' : 'bg-indigo-600 text-white'}`}>
        <FiUsers size={20} strokeWidth={2.2} />
      </span>
      <span className={`font-display text-[17px] font-extrabold tracking-[-0.04em] ${light ? 'text-white' : 'text-slate-900'}`}>
        people<span className={light ? 'text-indigo-200' : 'text-indigo-600'}>desk</span>
      </span>
    </span>
  )
}

export function AuthShell({ children, mode = 'login' }) {
  const isRegister = mode === 'register'
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(390px,0.92fr)_1.08fr]">
      <aside className="auth-gradient relative hidden min-h-screen overflow-hidden px-12 py-11 text-white lg:flex lg:flex-col xl:px-16">
        <div className="auth-grid pointer-events-none absolute inset-0" />
        <div className="relative z-10"><BrandMark light /></div>
        <div className="relative z-10 my-auto max-w-[500px] pb-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-indigo-50">
            <span className="size-1.5 rounded-full bg-emerald-300" />
            A clearer view of your people
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.12] tracking-[-0.055em] xl:text-[60px]">
            Good people.
            <br />
            Great work.
            <br />
            <span className="text-indigo-200">One place.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-indigo-100/85">
            Keep your employee directory in sync and the everyday details easy to find.
          </p>
          <div className="mt-12 flex max-w-md items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {['AL', 'JM', 'SK'].map((initials, index) => (
                <span
                  key={initials}
                  className={`grid size-10 place-items-center rounded-full border-2 border-[#4e47a4] text-[10px] font-bold ${
                    ['bg-amber-200 text-amber-900', 'bg-sky-200 text-sky-900', 'bg-rose-200 text-rose-900'][index]
                  }`}
                >
                  {initials}
                </span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Your people, at a glance</p>
              <p className="mt-0.5 text-xs text-indigo-100/75">A simpler way to stay organized</p>
            </div>
            <FiArrowUpRight size={17} className="text-indigo-100/80" />
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-indigo-100/65">
          <span>© PeopleDesk</span>
          <span className="inline-flex items-center gap-1.5"><FiCheck size={14} /> Private by design</span>
        </div>
      </aside>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-14 xl:px-24">
        <div className="lg:hidden"><BrandMark /></div>
        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              {isRegister ? 'Get started' : 'Welcome back'}
            </p>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.045em] text-slate-900 sm:text-[38px]">
              {isRegister ? 'Create your account' : 'Sign in to PeopleDesk'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isRegister
                ? 'Set up your account to access your employee directory.'
                : 'Your employee directory is just a moment away.'}
            </p>
          </div>
          {children}
        </div>
        <p className="text-center text-xs text-slate-400">Employee management, made simple.</p>
      </section>
    </main>
  )
}
