import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Eye, EyeOff } from 'lucide-react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { deleteTimeEntry, updateTimeEntry } from '../lib/queries'
import { formatDuration } from '../lib/time'
import type { TimeEntryWithActivity } from '../lib/types'

function dayLabel(iso: string): string {
  const d = parseISO(iso)
  if (isToday(d)) return '今天'
  if (isYesterday(d)) return '昨天'
  return format(d, 'M月d日 EEEE')
}

export default function TimeEntryList({ entries }: { entries: TimeEntryWithActivity[] }) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['time_entries'] })

  const delMut = useMutation({ mutationFn: deleteTimeEntry, onSuccess: invalidate })
  const pubMut = useMutation({
    mutationFn: ({ id, is_public }: { id: string; is_public: boolean }) =>
      updateTimeEntry(id, { is_public }),
    onSuccess: invalidate,
  })

  if (entries.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-400">还没有计时记录</p>
  }

  // 按天分组
  const groups = new Map<string, TimeEntryWithActivity[]>()
  for (const e of entries) {
    const key = e.started_at.slice(0, 10)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(e)
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([day, list]) => {
        const total = list.reduce((s, e) => s + e.duration_seconds, 0)
        return (
          <div key={day}>
            <div className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-600">{dayLabel(list[0].started_at)}</h3>
              <span className="text-xs text-slate-400">共 {formatDuration(total)}</span>
            </div>
            <div className="card divide-y divide-slate-100 p-0">
              {list.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="h-9 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: e.activity?.color ?? '#cbd5e1' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{e.activity?.name ?? '未分类'}</span>
                      {e.is_public && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600">
                          公开
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {format(parseISO(e.started_at), 'HH:mm')} – {format(parseISO(e.ended_at), 'HH:mm')}
                      {e.note ? ` · ${e.note}` : ''}
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-sm tabular-nums text-slate-700">
                    {formatDuration(e.duration_seconds)}
                  </span>
                  <button
                    className="shrink-0 p-1 text-slate-300 hover:text-emerald-600"
                    title={e.is_public ? '设为私密' : '设为公开'}
                    onClick={() => pubMut.mutate({ id: e.id, is_public: !e.is_public })}
                  >
                    {e.is_public ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    className="shrink-0 p-1 text-slate-300 hover:text-rose-600"
                    title="删除"
                    onClick={() => delMut.mutate(e.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
