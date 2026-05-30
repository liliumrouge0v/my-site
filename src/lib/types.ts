// 应用使用的数据类型,以及供 supabase-js 使用的简化 Database 泛型。

export interface Activity {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  sort: number
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  activity_id: string | null
  started_at: string
  ended_at: string
  duration_seconds: number
  note: string | null
  is_public: boolean
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  target_per_week: number
  archived: boolean
  is_public: boolean
  sort: number
  created_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  log_date: string // YYYY-MM-DD
  count: number
  note: string | null
  created_at: string
}

// 带活动信息的计时记录(查询时联表)
export interface TimeEntryWithActivity extends TimeEntry {
  activity: Pick<Activity, 'id' | 'name' | 'color' | 'icon'> | null
}
