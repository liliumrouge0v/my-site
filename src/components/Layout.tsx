import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Timer, ListChecks, BarChart3, LogOut, Share2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/', label: '今日', icon: LayoutDashboard, end: true },
  { to: '/timer', label: '计时', icon: Timer, end: false },
  { to: '/records', label: '记录', icon: BarChart3, end: false },
  { to: '/habits', label: '习惯', icon: ListChecks, end: false },
]

export default function Layout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl">
      {/* 桌面端侧边栏 */}
      <aside className="sticky top-0 hidden h-screen w-56 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Timer className="text-brand-600" size={22} />
          <span className="text-lg font-semibold">生活记录</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          <a
            href="/share"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <Share2 size={18} />
            公开页
          </a>
        </nav>
        <button onClick={handleSignOut} className="btn-ghost mt-2">
          <LogOut size={16} /> 退出
        </button>
      </aside>

      {/* 主内容 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-8">
          <Outlet />
        </main>

        {/* 移动端底部 Tab */}
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
                  isActive ? 'text-brand-600' : 'text-slate-400'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
