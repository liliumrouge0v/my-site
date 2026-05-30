import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Timer, Mail } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { session, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  if (!loading && session) return <Navigate to="/" replace />

  const signInPassword = async () => {
    setBusy(true)
    setErr(null)
    setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message)
    setBusy(false)
  }

  const sendMagicLink = async () => {
    if (!email) {
      setErr('请先填写邮箱')
      return
    }
    setBusy(true)
    setErr(null)
    setMsg(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) setErr(error.message)
    else setMsg('登录链接已发送到邮箱,点击邮件中的链接即可登录。')
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="rounded-2xl bg-brand-50 p-3">
            <Timer className="text-brand-600" size={28} />
          </div>
          <h1 className="text-xl font-semibold">生活记录</h1>
          <p className="text-sm text-slate-500">登录一次,之后会自动保持登录</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
            尚未配置 Supabase。请把 <code>.env.example</code> 复制为{' '}
            <code>.env.local</code> 并填入项目地址与 anon key。
          </div>
        )}

        <div className="space-y-3">
          <input
            className="input"
            type="email"
            placeholder="邮箱"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="密码"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && signInPassword()}
          />

          {err && <p className="text-sm text-rose-600">{err}</p>}
          {msg && <p className="text-sm text-emerald-600">{msg}</p>}

          <button className="btn-primary w-full" disabled={busy} onClick={signInPassword}>
            登录
          </button>
          <button className="btn-ghost w-full" disabled={busy} onClick={sendMagicLink}>
            <Mail size={16} /> 用邮箱链接登录
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          账号在 Supabase 控制台 Authentication → Users 中创建
        </p>
      </div>
    </div>
  )
}
