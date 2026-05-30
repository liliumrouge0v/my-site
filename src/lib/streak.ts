// 连续打卡天数计算 —— 纯函数,输入打卡日期字符串集合(YYYY-MM-DD)。

import { differenceInCalendarDays, parseISO } from 'date-fns'
import { todayISO } from './date'

export interface StreakInfo {
  current: number // 当前连续天数(截至今天/昨天)
  best: number // 历史最佳连续天数
}

/**
 * 根据已打卡日期计算当前与最佳连续天数。
 * 当前连续天数:从今天往回数;若今天还没打卡,但昨天打了,连续仍然成立(从昨天起算)。
 */
export function computeStreak(dates: string[]): StreakInfo {
  if (dates.length === 0) return { current: 0, best: 0 }

  const unique = Array.from(new Set(dates)).sort() // 升序
  const days = unique.map((d) => parseISO(d))

  // 最佳连续:遍历相邻日期,差 1 天则累加
  let best = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    const gap = differenceInCalendarDays(days[i], days[i - 1])
    if (gap === 1) {
      run += 1
      best = Math.max(best, run)
    } else if (gap > 1) {
      run = 1
    }
  }

  // 当前连续:从最近一天往回
  const today = parseISO(todayISO())
  const last = days[days.length - 1]
  const gapFromToday = differenceInCalendarDays(today, last)

  let current = 0
  if (gapFromToday <= 1) {
    current = 1
    for (let i = days.length - 1; i > 0; i--) {
      if (differenceInCalendarDays(days[i], days[i - 1]) === 1) current += 1
      else break
    }
  }

  return { current, best: Math.max(best, current) }
}
