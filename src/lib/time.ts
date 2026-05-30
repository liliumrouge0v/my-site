// 时间/时长相关的纯函数工具。

/** 把秒数格式化为 HH:MM:SS(用于运行中的秒表)。 */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}

/** 把秒数格式化为人类可读时长,如 "1小时23分"、"5分12秒"、"45秒"。 */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}小时${m > 0 ? `${m}分` : ''}`
  if (m > 0) return `${m}分${sec > 0 ? `${sec}秒` : ''}`
  return `${sec}秒`
}

/** 把分钟数格式化为统计图用的简短标签,如 "1.5h" / "25m"。 */
export function formatMinutesShort(minutes: number): string {
  if (minutes >= 60) {
    const h = minutes / 60
    return `${Number.isInteger(h) ? h : h.toFixed(1)}h`
  }
  return `${Math.round(minutes)}m`
}
