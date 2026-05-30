import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { isSameDay, parseISO } from 'date-fns'
import { thisWeekDays, WEEKDAY_LABELS } from '../lib/date'
import { formatDuration, formatMinutesShort } from '../lib/time'
import type { TimeEntryWithActivity } from '../lib/types'

export default function StatsChart({ entries }: { entries: TimeEntryWithActivity[] }) {
  const week = thisWeekDays()

  // 本周每天的总时长(分钟)
  const dayData = useMemo(
    () =>
      week.map((d, i) => {
        const seconds = entries
          .filter((e) => isSameDay(parseISO(e.started_at), d))
          .reduce((s, e) => s + e.duration_seconds, 0)
        return { label: WEEKDAY_LABELS[i], minutes: Math.round(seconds / 60), isToday: isSameDay(d, new Date()) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries],
  )

  // 本周各活动总时长
  const byActivity = useMemo(() => {
    const start = week[0]
    const map = new Map<string, { name: string; color: string; seconds: number }>()
    for (const e of entries) {
      const d = parseISO(e.started_at)
      if (d < start) continue
      const key = e.activity?.id ?? 'none'
      const cur = map.get(key) ?? {
        name: e.activity?.name ?? '未分类',
        color: e.activity?.color ?? '#cbd5e1',
        seconds: 0,
      }
      cur.seconds += e.duration_seconds
      map.set(key, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.seconds - a.seconds)
  }, [entries])

  const weekTotal = byActivity.reduce((s, a) => s + a.seconds, 0)

  return (
    <div className="card">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-semibold">本周时间分布</h3>
        <span className="text-sm text-slate-400">合计 {formatDuration(weekTotal)}</span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dayData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
            <YAxis
              tickFormatter={(v) => formatMinutesShort(v)}
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="#94a3b8"
              width={40}
            />
            <Tooltip
              cursor={{ fill: '#f1f5f9' }}
              formatter={(v: number) => [formatDuration(v * 60), '时长']}
              labelFormatter={(l) => `周${l}`}
            />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
              {dayData.map((d, i) => (
                <Cell key={i} fill={d.isToday ? '#4f46e5' : '#c7d2fe'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {byActivity.length > 0 && (
        <div className="mt-4 space-y-2">
          {byActivity.map((a) => (
            <div key={a.name} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: a.color }} />
              <span className="w-20 shrink-0 truncate text-sm">{a.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${weekTotal ? (a.seconds / weekTotal) * 100 : 0}%`,
                    backgroundColor: a.color,
                  }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-slate-500">
                {formatDuration(a.seconds)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
