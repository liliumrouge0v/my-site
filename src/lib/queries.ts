// 所有 Supabase 数据读写收口在此。页面通过 TanStack Query 调用这些函数。

import { supabase } from './supabase'
import type {
  Activity,
  Habit,
  HabitLog,
  TimeEntry,
  TimeEntryWithActivity,
} from './types'

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('未登录')
  return data.user.id
}

// ============ 活动 Activities ============
export async function listActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('sort', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createActivity(input: {
  name: string
  color?: string
  icon?: string
}): Promise<Activity> {
  const user_id = await requireUserId()
  const { data, error } = await supabase
    .from('activities')
    .insert({ ...input, user_id })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw error
}

// ============ 计时记录 Time entries ============
const ENTRY_SELECT =
  '*, activity:activities(id, name, color, icon)'

export async function listTimeEntries(limit = 200): Promise<TimeEntryWithActivity[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(ENTRY_SELECT)
    .order('started_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as unknown as TimeEntryWithActivity[]
}

export async function createTimeEntry(input: {
  activity_id: string | null
  started_at: string
  ended_at: string
  duration_seconds: number
  note?: string | null
  is_public?: boolean
}): Promise<TimeEntry> {
  const user_id = await requireUserId()
  const { data, error } = await supabase
    .from('time_entries')
    .insert({ ...input, user_id })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateTimeEntry(
  id: string,
  patch: Partial<Pick<TimeEntry, 'note' | 'is_public' | 'activity_id'>>,
): Promise<void> {
  const { error } = await supabase.from('time_entries').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase.from('time_entries').delete().eq('id', id)
  if (error) throw error
}

// ============ 习惯 Habits ============
export async function listHabits(includeArchived = false): Promise<Habit[]> {
  let q = supabase
    .from('habits')
    .select('*')
    .order('sort', { ascending: true })
    .order('created_at', { ascending: true })
  if (!includeArchived) q = q.eq('archived', false)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createHabit(input: {
  name: string
  color?: string
  icon?: string
  target_per_week?: number
}): Promise<Habit> {
  const user_id = await requireUserId()
  const { data, error } = await supabase
    .from('habits')
    .insert({ ...input, user_id })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateHabit(
  id: string,
  patch: Partial<
    Pick<Habit, 'name' | 'color' | 'icon' | 'target_per_week' | 'archived' | 'is_public'>
  >,
): Promise<void> {
  const { error } = await supabase.from('habits').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteHabit(id: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw error
}

// ============ 习惯打卡 Habit logs ============
export async function listHabitLogs(sinceISO?: string): Promise<HabitLog[]> {
  let q = supabase.from('habit_logs').select('*').order('log_date', { ascending: false })
  if (sinceISO) q = q.gte('log_date', sinceISO)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

/** 打卡(幂等):同一习惯同一天存在则更新 count,否则插入。 */
export async function toggleHabitLog(
  habit_id: string,
  log_date: string,
  on: boolean,
): Promise<void> {
  if (on) {
    const user_id = await requireUserId()
    const { error } = await supabase
      .from('habit_logs')
      .upsert({ habit_id, log_date, count: 1, user_id }, { onConflict: 'habit_id,log_date' })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habit_id)
      .eq('log_date', log_date)
    if (error) throw error
  }
}

// ============ 公开数据(免登录)============
export async function listPublicTimeEntries(): Promise<TimeEntryWithActivity[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(ENTRY_SELECT)
    .eq('is_public', true)
    .order('started_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as unknown as TimeEntryWithActivity[]
}

export async function listPublicHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('is_public', true)
    .eq('archived', false)
    .order('sort', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function listPublicHabitLogs(): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .order('log_date', { ascending: false })
  if (error) throw error
  return data ?? []
}
