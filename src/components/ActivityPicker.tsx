import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { createActivity, deleteActivity, listActivities } from '../lib/queries'

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6',
]

export default function ActivityPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (id: string | null) => void
}) {
  const qc = useQueryClient()
  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: listActivities,
  })
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const createMut = useMutation({
    mutationFn: () =>
      createActivity({
        name: name.trim(),
        color: PRESET_COLORS[activities.length % PRESET_COLORS.length],
      }),
    onSuccess: (a) => {
      qc.invalidateQueries({ queryKey: ['activities'] })
      onChange(a.id)
      setName('')
      setAdding(false)
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: ['activities'] })
      if (value === id) onChange(null)
    },
  })

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {activities.map((a) => {
        const selected = a.id === value
        return (
          <button
            key={a.id}
            onClick={() => onChange(a.id)}
            className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              selected
                ? 'border-transparent text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
            style={selected ? { backgroundColor: a.color } : undefined}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: selected ? 'rgba(255,255,255,.8)' : a.color }}
            />
            {a.name}
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`删除活动「${a.name}」?(已有记录会保留)`)) deleteMut.mutate(a.id)
              }}
              className="ml-1 hidden rounded-full p-0.5 opacity-70 hover:opacity-100 group-hover:inline-flex"
            >
              <X size={13} />
            </span>
          </button>
        )
      })}

      {adding ? (
        <span className="flex items-center gap-1">
          <input
            autoFocus
            className="input w-32 py-1.5"
            placeholder="活动名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) createMut.mutate()
              if (e.key === 'Escape') setAdding(false)
            }}
          />
          <button
            className="btn-primary py-1.5"
            disabled={!name.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            添加
          </button>
        </span>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-4 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600"
        >
          <Plus size={16} /> 新活动
        </button>
      )}
    </div>
  )
}
