import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Flame, Eye, EyeOff, Trash2, Archive } from 'lucide-react'
import { deleteHabit, toggleHabitLog, updateHabit } from '../lib/queries'
import { computeStreak } from '../lib/streak'
import { todayISO } from '../lib/date'
import HabitGrid from './HabitGrid'
import type { Habit, HabitLog } from '../lib/types'

export default function HabitCard({ habit, logs }: { habit: Habit; logs: HabitLog[] }) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['habit_logs'] })
    qc.invalidateQueries({ queryKey: ['habits'] })
  }

  const dates = useMemo(() => logs.map((l) => l.log_date), [logs])
  const completed = useMemo(() => new Set(dates), [dates])
  const streak = useMemo(() => computeStreak(dates), [dates])
  const today = todayISO()
  const doneToday = completed.has(today)

  const toggleMut = useMutation({
    mutationFn: () => toggleHabitLog(habit.id, today, !doneToday),
    onSuccess: invalidate,
  })
  const pubMut = useMutation({
    mutationFn: () => updateHabit(habit.id, { is_public: !habit.is_public }),
    onSuccess: invalidate,
  })
  const archiveMut = useMutation({
    mutationFn: () => updateHabit(habit.id, { archived: true }),
    onSuccess: invalidate,
  })
  const delMut = useMutation({
    mutationFn: () => deleteHabit(habit.id),
    onSuccess: invalidate,
  })

  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={() => toggleMut.mutate()}
          disabled={toggleMut.isPending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-90"
          style={{
            borderColor: habit.color,
            backgroundColor: doneToday ? habit.color : 'transparent',
          }}
          title={doneToday ? '取消今天打卡' : '今天打卡'}
        >
          <Check size={22} className={doneToday ? 'text-white' : 'text-transparent'} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold">{habit.name}</span>
            {habit.is_public && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600">
                公开
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Flame size={13} className={streak.current > 0 ? 'text-orange-500' : ''} />
            连续 {streak.current} 天 · 最佳 {streak.best} 天
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 text-slate-300">
          <button
            className="p-1.5 hover:text-emerald-600"
            title={habit.is_public ? '设为私密' : '设为公开'}
            onClick={() => pubMut.mutate()}
          >
            {habit.is_public ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            className="p-1.5 hover:text-amber-600"
            title="归档"
            onClick={() => confirm(`归档习惯「${habit.name}」?`) && archiveMut.mutate()}
          >
            <Archive size={15} />
          </button>
          <button
            className="p-1.5 hover:text-rose-600"
            title="删除"
            onClick={() => confirm(`删除习惯「${habit.name}」及其所有打卡记录?`) && delMut.mutate()}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <HabitGrid completed={completed} color={habit.color} />
    </div>
  )
}
