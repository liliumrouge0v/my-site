import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** 是否已配置 Supabase。未配置时页面会给出友好提示而不是直接崩溃。 */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // 仅在开发时提醒,避免空配置导致难以排查的错误
  console.warn(
    '[supabase] 未检测到 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY,请复制 .env.example 为 .env.local 并填写。',
  )
}

export const supabase = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'life-tracker-auth',
    },
  },
)
