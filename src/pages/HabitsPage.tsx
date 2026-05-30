import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { createHabit, listHabitLogs, listHabits } from '../lib/queries'
import HabitCard from '../components/HabitCard'
import type { HabitLog } from '../lib/types'

const PRESET_COLORS = [
  '#22c55e', '#6366f1', '#ec4899', '#f59e0b',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
]

export default function HabitsPage() {
  const qc = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => listHabits(),
  })
  const { data: logs = [] } = useQuery({
    queryKey: ['habit_logs'],
    queryFn: () => listHabitLogs(),
  })

  const logsByHabit = new Map<string, HabitLog[]>()
  for (const l of logs) {
    if (!logsByHabit.has(l.habit_id)) logsByHabit.set(l.habit_id, [])
    logsByHabit.get(l.habit_id)!.push(l)
  }

  const createMut = useMutation({
    mutationFn: () => createHabit({ name: name.trim(), color }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      setName('')
      setAdding(false)
    },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">习惯打卡</h1>
        <button className="btn-primary" onClick={() => setAdding((v) => !v)}>
          <Plus size={16} /> 新习惯
        </button>
      </div>

      {adding && (
        <div className="card space-y-3">
          <input
            autoFocus
            className="input"
            placeholder="习惯名称,例如:喝水、运动、早睡"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && createMut.mutate()}
          />
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full ring-2 ring-offset-2 transition ${
                  color === c ? 'ring-slate-400' : 'ring-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary"
              disabled={!name.trim() || createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              创建
            </button>
            <button className="btn-ghost" onClick={() => setAdding(false)}>
              取消
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">加载中…</p>
      ) : habits.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          还没有习惯,点右上角「新习惯」开始吧
        </p>
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} logs={logsByHabit.get(h.id) ?? []} />
          ))}
        </div>
      )}
    </div>
  )
}
