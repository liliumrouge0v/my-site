// 日期工具 —— 统一使用本地时区,日期键格式为 YYYY-MM-DD。

import { format, startOfWeek, addDays, subDays } from 'date-fns'

export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return toISODate(new Date())
}

/** 本周一作为一周开始(中国习惯)。 */
export function weekStart(d: Date = new Date()): Date {
  return startOfWeek(d, { weekStartsOn: 1 })
}

/** 返回最近 n 天的日期(升序),含今天。 */
export function lastNDays(n: number): Date[] {
  const today = new Date()
  const out: Date[] = []
  for (let i = n - 1; i >= 0; i--) out.push(subDays(today, i))
  return out
}

/** 本周 7 天(周一到周日)。 */
export function thisWeekDays(): Date[] {
  const start = weekStart()
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']
