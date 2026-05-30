import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, PencilLine } from 'lucide-react'
import Stopwatch, { type StopwatchResult } from '../components/Stopwatch'
import ActivityPicker from '../components/ActivityPicker'
import { createTimeEntry } from '../lib/queries'
import { formatDuration } from '../lib/time'

export default function TimerPage() {
  const qc = useQueryClient()
  const [activityId, setActivityId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const [manualMin, setManualMin] = useState('')

  const saveMut = useMutation({
    mutationFn: (r: StopwatchResult) =>
      createTimeEntry({
        activity_id: activityId,
        started_at: r.startedAt,
        ended_at: r.endedAt,
        duration_seconds: r.durationSeconds,
        note: note.trim() || null,
      }),
    onSuccess: (_d, r) => {
      qc.invalidateQueries({ queryKey: ['time_entries'] })
      setSaved(`已保存 ${formatDuration(r.durationSeconds)}`)
      setNote('')
      setTimeout(() => setSaved(null), 3000)
    },
  })

  const manualMut = useMutation({
    mutationFn: () => {
      const minutes = Math.max(1, Math.round(Number(manualMin)))
      const end = new Date()
      const start = new Date(end.getTime() - minutes * 60_000)
      return createTimeEntry({
        activity_id: activityId,
        started_at: start.toISOString(),
        ended_at: end.toISOString(),
        duration_seconds: minutes * 60,
        note: note.trim() || null,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time_entries'] })
      setSaved(`已补录 ${manualMin} 分钟`)
      setManualMin('')
      setNote('')
      setManual(false)
      setTimeout(() => setSaved(null), 3000)
    },
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">计时器</h1>
      <p className="mb-6 text-sm text-slate-500">选一个活动,开始掐表。刷新页面也不会丢失。</p>

      <div className="card mb-5">
        <p className="mb-3 text-center text-sm font-medium text-slate-500">在做什么?</p>
        <ActivityPicker value={activityId} onChange={setActivityId} />
      </div>

      <div className="card mb-5 py-10">
        <Stopwatch onStop={(r) => saveMut.mutate(r)} />
      </div>

      <div className="card space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <PencilLine size={15} /> 备注(可选)
        </div>
        <input
          className="input"
          placeholder="比如:读完了第三章"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {manual ? (
          <div className="flex items-center gap-2">
            <input
              className="input w-28"
              type="number"
              min={1}
              placeholder="分钟"
              value={manualMin}
              onChange={(e) => setManualMin(e.target.value)}
            />
            <button
              className="btn-primary"
              disabled={!Number(manualMin) || manualMut.isPending}
              onClick={() => manualMut.mutate()}
            >
              补录
            </button>
            <button className="btn-ghost" onClick={() => setManual(false)}>
              取消
            </button>
          </div>
        ) : (
          <button className="text-sm text-brand-600 hover:underline" onClick={() => setManual(true)}>
            手动补录一段时间
          </button>
        )}
      </div>

      {saved && (
        <div className="fixed bottom-24 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg md:bottom-8">
          <Check size={16} /> {saved}
        </div>
      )}
    </div>
  )
}
