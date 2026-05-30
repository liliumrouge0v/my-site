import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Timer, Flame } from 'lucide-react'
import {
  listPublicHabitLogs,
  listPublicHabits,
  listPublicTimeEntries,
} from '../lib/queries'
import { computeStreak } from '../lib/streak'
import { formatDuration } from '../lib/time'
import HabitGrid from '../components/HabitGrid'
import type { HabitLog } from '../lib/types'

export default function SharePage() {
  const { data: entries = [] } = useQuery({
    queryKey: ['public_entries'],
    queryFn: listPublicTimeEntries,
  })
  const { data: habits = [] } = useQuery({
    queryKey: ['public_habits'],
    queryFn: listPublicHabits,
  })
  const { data: logs = [] } = useQuery({
    queryKey: ['public_logs'],
    queryFn: listPublicHabitLogs,
  })

  const logsByHabit = useMemo(() => {
    const m = new Map<string, HabitLog[]>()
    for (const l of logs) {
      if (!m.has(l.habit_id)) m.set(l.habit_id, [])
      m.get(l.habit_id)!.push(l)
    }
    return m
  }, [logs])

  const nothing = entries.length === 0 && habits.length === 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8 flex items-center gap-2">
          <Timer className="text-brand-600" size={24} />
          <h1 className="text-xl font-semibold">我的生活记录</h1>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-400">
            公开浏览
          </span>
        </header>

        {nothing && (
          <p className="py-20 text-center text-sm text-slate-400">这里还没有公开的内容</p>
        )}

        {habits.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold text-slate-600">习惯</h2>
            <div className="space-y-4">
              {habits.map((h) => {
                const hlogs = logsByHabit.get(h.id) ?? []
                const streak = computeStreak(hlogs.map((l) => l.log_date))
                return (
                  <div key={h.id} className="card">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="font-semibold">{h.name}</span>
                      <span className="ml-auto flex items-center gap-1 text-xs text-orange-500">
                        <Flame size={13} /> 连续 {streak.current} 天
                      </span>
                    </div>
                    <HabitGrid completed={new Set(hlogs.map((l) => l.log_date))} color={h.color} />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {entries.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-600">时间记录</h2>
            <div className="card divide-y divide-slate-100 p-0">
              {entries.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="h-8 w-1.5 rounded-full"
                    style={{ backgroundColor: e.activity?.color ?? '#cbd5e1' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{e.activity?.name ?? '未分类'}</div>
                    {e.note && <div className="truncate text-xs text-slate-400">{e.note}</div>}
                  </div>
                  <span className="font-mono text-sm tabular-nums text-slate-600">
                    {formatDuration(e.duration_seconds)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
