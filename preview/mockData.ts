// 预览用示例数据(仅用于本地预览,不进入正式应用)。
import { subDays } from 'date-fns'
import { toISODate } from '../src/lib/date'
import type { Activity, Habit, HabitLog, TimeEntryWithActivity } from '../src/lib/types'

const iso = (d: Date) => d.toISOString()
const now = new Date()
const at = (daysAgo: number, h: number, m: number) => {
  const d = subDays(now, daysAgo)
  d.setHours(h, m, 0, 0)
  return d
}

export const activities: Activity[] = [
  { id: 'a1', user_id: 'me', name: '读书', color: '#6366f1', icon: 'circle', sort: 0, created_at: iso(now) },
  { id: 'a2', user_id: 'me', name: '健身', color: '#ec4899', icon: 'circle', sort: 1, created_at: iso(now) },
  { id: 'a3', user_id: 'me', name: '工作', color: '#f59e0b', icon: 'circle', sort: 2, created_at: iso(now) },
  { id: 'a4', user_id: 'me', name: '冥想', color: '#10b981', icon: 'circle', sort: 3, created_at: iso(now) },
]

const A = (id: string) => {
  const a = activities.find((x) => x.id === id)!
  return { id: a.id, name: a.name, color: a.color, icon: a.icon }
}

function entry(
  id: string,
  actId: string,
  daysAgo: number,
  h: number,
  m: number,
  durMin: number,
  note: string | null,
  isPublic = false,
): TimeEntryWithActivity {
  const start = at(daysAgo, h, m)
  const end = new Date(start.getTime() + durMin * 60000)
  return {
    id,
    user_id: 'me',
    activity_id: actId,
    started_at: iso(start),
    ended_at: iso(end),
    duration_seconds: durMin * 60,
    note,
    is_public: isPublic,
    created_at: iso(end),
  }
}

export const timeEntries: TimeEntryWithActivity[] = [
  entry('e1', 'a1', 0, 8, 30, 45, '读完《深度工作》第三章', true),
  entry('e2', 'a3', 0, 10, 0, 110, '写项目方案'),
  entry('e3', 'a2', 0, 18, 30, 50, '力量训练'),
  entry('e4', 'a4', 1, 7, 0, 15, null, true),
  entry('e5', 'a3', 1, 9, 30, 130, '会议 + 编码'),
  entry('e6', 'a1', 1, 21, 0, 35, null),
  entry('e7', 'a2', 2, 19, 0, 60, '跑步 5 公里'),
  entry('e8', 'a3', 2, 14, 0, 95, null),
  entry('e9', 'a1', 3, 22, 0, 40, '睡前阅读'),
  entry('e10', 'a4', 4, 7, 30, 20, null),
  entry('e11', 'a3', 4, 11, 0, 150, null),
].map((e) => ({ ...e, activity: A(e.activity_id!) }))

export const habits: Habit[] = [
  { id: 'h1', user_id: 'me', name: '喝 8 杯水', color: '#3b82f6', icon: 'check', target_per_week: 7, archived: false, is_public: true, sort: 0, created_at: iso(now) },
  { id: 'h2', user_id: 'me', name: '运动', color: '#22c55e', icon: 'check', target_per_week: 5, archived: false, is_public: true, sort: 1, created_at: iso(now) },
  { id: 'h3', user_id: 'me', name: '早睡', color: '#8b5cf6', icon: 'check', target_per_week: 7, archived: false, is_public: false, sort: 2, created_at: iso(now) },
  { id: 'h4', user_id: 'me', name: '阅读', color: '#f59e0b', icon: 'check', target_per_week: 7, archived: false, is_public: false, sort: 3, created_at: iso(now) },
]

// 为每个习惯生成一段打卡历史(部分带断点,体现连续天数)
function logsFor(habitId: string, pattern: (i: number) => boolean, span = 90): HabitLog[] {
  const out: HabitLog[] = []
  for (let i = 0; i < span; i++) {
    if (pattern(i)) {
      out.push({
        id: `${habitId}-${i}`,
        user_id: 'me',
        habit_id: habitId,
        log_date: toISODate(subDays(now, i)),
        count: 1,
        note: null,
        created_at: iso(now),
      })
    }
  }
  return out
}

export const habitLogs: HabitLog[] = [
  ...logsFor('h1', (i) => i % 7 !== 5), // 喝水:几乎每天
  ...logsFor('h2', (i) => i < 12 ? i % 2 === 0 : i % 3 === 0), // 运动:隔天
  ...logsFor('h3', (i) => i > 1 && i % 4 !== 0), // 早睡:今明天断了
  ...logsFor('h4', (i) => i % 3 !== 2), // 阅读
]

export const publicEntries = timeEntries.filter((e) => e.is_public)
export const publicHabits = habits.filter((h) => h.is_public)
export const publicLogs = habitLogs.filter((l) => publicHabits.some((h) => h.id === l.habit_id))
