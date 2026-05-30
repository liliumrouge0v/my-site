import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Timer, Check, Flame, ArrowRight } from 'lucide-react'
import { isToday, parseISO } from 'date-fns'
import {
  listHabitLogs,
  listHabits,
  listTimeEntries,
  toggleHabitLog,
} from '../lib/queries'
import { formatDuration } from '../lib/time'
import { computeStreak } from '../lib/streak'
import { todayISO } from '../lib/date'
import type { HabitLog } from '../lib/types'

export default function Dashboard() {
  const qc = useQueryClient()
  const today = todayISO()

  const { data: entries = [] } = useQuery({
    queryKey: ['time_entries'],
    queryFn: () => listTimeEntries(),
  })
  const { data: habits = [] } = useQuery({ queryKey: ['habits'], queryFn: () => listHabits() })
  const { data: logs = [] } = useQuery({ queryKey: ['habit_logs'], queryFn: () => listHabitLogs() })

  const todaySeconds = useMemo(
    () =>
      entries
        .filter((e) => isToday(parseISO(e.started_at)))
        .reduce((s, e) => s + e.duration_seconds, 0),
    [entries],
  )

  const logsByHabit = useMemo(() => {
    const m = new Map<string, HabitLog[]>()
    for (const l of logs) {
      if (!m.has(l.habit_id)) m.set(l.habit_id, [])
      m.get(l.habit_id)!.push(l)
    }
    return m
  }, [logs])

  const doneCount = habits.filter((h) =>
    (logsByHabit.get(h.id) ?? []).some((l) => l.log_date === today),
  ).length

  const toggleMut = useMutation({
    mutationFn: ({ habitId, on }: { habitId: string; on: boolean }) =>
      toggleHabitLog(habitId, today, on),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habit_logs'] }),
  })

  const now = new Date()
  const greeting = now.getHours() < 11 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好'

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{greeting} 👋</h1>
        <p className="text-sm text-slate-500">
          {now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 今日概览 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Timer size={14} /> 今日计时
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {todaySeconds > 0 ? formatDuration(todaySeconds) : '—'}
          </div>
        </div>
        <div className="card">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Check size={14} /> 今日习惯
          </div>
          <div className="text-2xl font-bold tabular-nums">
            {doneCount}
            <span className="text-base font-normal text-slate-400">/{habits.length}</span>
          </div>
        </div>
      </div>

      {/* 快速开始计时 */}
      <Link
        to="/timer"
        className="card flex items-center justify-between bg-brand-600 text-white ring-0 hover:bg-brand-700"
      >
        <span className="flex items-center gap-3 font-medium">
          <Timer size={20} /> 开始一段计时
        </span>
        <ArrowRight size={18} />
      </Link>

      {/* 今日习惯快速打卡 */}
      <div>
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-slate-600">今日习惯</h2>
          <Link to="/habits" className="text-xs text-brand-600 hover:underline">
            管理
          </Link>
        </div>
        {habits.length === 0 ? (
          <div className="card text-center text-sm text-slate-400">
            还没有习惯,去
            <Link to="/habits" className="text-brand-600">
              {' '}
              添加一个{' '}
            </Link>
            吧
          </div>
        ) : (
          <div className="card space-y-1 p-2">
            {habits.map((h) => {
              const hlogs = logsByHabit.get(h.id) ?? []
              const done = hlogs.some((l) => l.log_date === today)
              const streak = computeStreak(hlogs.map((l) => l.log_date))
              return (
                <button
                  key={h.id}
                  onClick={() => toggleMut.mutate({ habitId: h.id, on: !done })}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 transition"
                    style={{ borderColor: h.color, backgroundColor: done ? h.color : 'transparent' }}
                  >
                    <Check size={16} className={done ? 'text-white' : 'text-transparent'} />
                  </span>
                  <span className="flex-1 font-medium">{h.name}</span>
                  {streak.current > 0 && (
                    <span className="flex items-center gap-1 text-xs text-orange-500">
                      <Flame size={13} /> {streak.current}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
