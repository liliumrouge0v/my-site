import { addDays, isAfter, startOfWeek, subWeeks } from 'date-fns'
import { toISODate, WEEKDAY_LABELS } from '../lib/date'

const WEEKS = 16

/** GitHub 风格的打卡热力网格:列为周,行为周一~周日。 */
export default function HabitGrid({
  completed,
  color,
}: {
  completed: Set<string>
  color: string
}) {
  const today = new Date()
  const start = startOfWeek(subWeeks(today, WEEKS - 1), { weekStartsOn: 1 })

  const columns = Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)),
  )

  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between py-[1px] text-[9px] leading-none text-slate-300">
        {WEEKDAY_LABELS.map((l, i) => (
          <span key={i} className="h-[10px]">
            {i % 2 === 0 ? l : ''}
          </span>
        ))}
      </div>
      <div className="flex gap-[3px] overflow-x-auto">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((day, di) => {
              const future = isAfter(day, today)
              const done = completed.has(toISODate(day))
              return (
                <div
                  key={di}
                  className="h-[10px] w-[10px] rounded-[2px]"
                  style={{
                    backgroundColor: future ? 'transparent' : done ? color : '#eef0f3',
                  }}
                  title={toISODate(day)}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
