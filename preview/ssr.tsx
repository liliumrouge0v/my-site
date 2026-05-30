// 服务端渲染:把各页面渲染成静态 HTML(内容直接进 DOM,无需运行 JS 即可查看)。
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../src/context/AuthContext'
import Layout from '../src/components/Layout'
import Dashboard from '../src/pages/Dashboard'
import TimerPage from '../src/pages/TimerPage'
import RecordsPage from '../src/pages/RecordsPage'
import HabitsPage from '../src/pages/HabitsPage'
import SharePage from '../src/pages/SharePage'
import {
  activities,
  habitLogs,
  habits,
  publicEntries,
  publicHabits,
  publicLogs,
  timeEntries,
} from './mockData'

// 渲染期间 Stopwatch 会读取 localStorage,在 Node 里补一个内存桩
function ensureLocalStorage() {
  if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
    const store = new Map<string, string>()
    ;(globalThis as { localStorage: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    }
  }
}

function makeClient() {
  const qc = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: false } },
  })
  qc.setQueryData(['activities'], activities)
  qc.setQueryData(['time_entries'], timeEntries)
  qc.setQueryData(['habits'], habits)
  qc.setQueryData(['habit_logs'], habitLogs)
  qc.setQueryData(['public_entries'], publicEntries)
  qc.setQueryData(['public_habits'], publicHabits)
  qc.setQueryData(['public_logs'], publicLogs)
  return qc
}

function renderInApp(path: string, withLayout: boolean) {
  const qc = makeClient()
  const inner = withLayout ? (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/habits" element={<HabitsPage />} />
      </Route>
    </Routes>
  ) : (
    <Routes>
      <Route path="/share" element={<SharePage />} />
    </Routes>
  )
  return renderToString(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>{inner}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

export function renderSections(): { title: string; html: string }[] {
  ensureLocalStorage()
  return [
    { title: '今日总览', html: renderInApp('/', true) },
    { title: '计时器', html: renderInApp('/timer', true) },
    { title: '时间记录与统计', html: renderInApp('/records', true) },
    { title: '习惯打卡', html: renderInApp('/habits', true) },
    { title: '公开页 /share(朋友看到的)', html: renderInApp('/share', false) },
  ]
}
