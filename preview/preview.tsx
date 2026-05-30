// 预览入口:用示例数据填充缓存,绕过登录与 Supabase,展示真实页面与交互。
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '../src/components/Layout'
import Dashboard from '../src/pages/Dashboard'
import TimerPage from '../src/pages/TimerPage'
import RecordsPage from '../src/pages/RecordsPage'
import HabitsPage from '../src/pages/HabitsPage'
import SharePage from '../src/pages/SharePage'
import { AuthProvider } from '../src/context/AuthContext'
import '../src/index.css'
import {
  activities,
  habitLogs,
  habits,
  publicEntries,
  publicHabits,
  publicLogs,
  timeEntries,
} from './mockData'

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: false } },
})
// 预填缓存,页面读取时不会发起网络请求
qc.setQueryData(['activities'], activities)
qc.setQueryData(['time_entries'], timeEntries)
qc.setQueryData(['habits'], habits)
qc.setQueryData(['habit_logs'], habitLogs)
qc.setQueryData(['public_entries'], publicEntries)
qc.setQueryData(['public_habits'], publicHabits)
qc.setQueryData(['public_logs'], publicLogs)

function PreviewShell() {
  // share 单独全屏展示;其余四页走真实 Layout 导航
  const [showShare, setShowShare] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center gap-3 bg-amber-50 px-4 py-2 text-xs text-amber-800">
        <span className="font-semibold">预览模式</span>
        <span className="hidden sm:inline">示例数据 · 无需登录 · 可点击体验</span>
        <button
          className="ml-auto rounded-full bg-white px-3 py-1 font-medium text-amber-700 ring-1 ring-amber-200"
          onClick={() => setShowShare((v) => !v)}
        >
          {showShare ? '← 返回应用' : '查看公开页 /share →'}
        </button>
      </div>

      {showShare ? (
        <SharePage />
      ) : (
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="timer" element={<TimerPage />} />
              <Route path="records" element={<RecordsPage />} />
              <Route path="habits" element={<HabitsPage />} />
            </Route>
            <Route path="share" element={<SharePage />} />
          </Routes>
        </MemoryRouter>
      )}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <PreviewShell />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
