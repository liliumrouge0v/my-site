import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'
import { formatClock } from '../lib/time'

const STORAGE_KEY = 'life-tracker-stopwatch'

interface StopwatchState {
  firstStartedAt: number | null // 第一次开始的时间(作为记录的 started_at)
  running: boolean
  segmentStart: number | null // 当前运行片段的开始时间(ms)
  accumulated: number // 之前片段累计的秒数
}

const EMPTY: StopwatchState = {
  firstStartedAt: null,
  running: false,
  segmentStart: null,
  accumulated: 0,
}

function load(): StopwatchState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return EMPTY
}

function save(s: StopwatchState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function elapsedSeconds(s: StopwatchState): number {
  const live = s.running && s.segmentStart ? (Date.now() - s.segmentStart) / 1000 : 0
  return s.accumulated + live
}

export interface StopwatchResult {
  startedAt: string
  endedAt: string
  durationSeconds: number
}

export default function Stopwatch({
  onStop,
  disabled,
}: {
  onStop: (r: StopwatchResult) => void
  disabled?: boolean
}) {
  const [state, setState] = useState<StopwatchState>(() => load())
  const [, forceTick] = useState(0)
  const intervalRef = useRef<number | null>(null)

  // 运行时每 200ms 重绘(elapsed 由时间戳推算,不依赖累加,刷新也准确)
  useEffect(() => {
    if (state.running) {
      intervalRef.current = window.setInterval(() => forceTick((n) => n + 1), 200)
      return () => {
        if (intervalRef.current) window.clearInterval(intervalRef.current)
      }
    }
  }, [state.running])

  const update = (next: StopwatchState) => {
    save(next)
    setState(next)
  }

  const handleStart = () => {
    const now = Date.now()
    update({
      firstStartedAt: state.firstStartedAt ?? now,
      running: true,
      segmentStart: now,
      accumulated: state.accumulated,
    })
  }

  const handlePause = () => {
    update({
      ...state,
      running: false,
      segmentStart: null,
      accumulated: elapsedSeconds(state),
    })
  }

  const handleStop = () => {
    const total = Math.round(elapsedSeconds(state))
    const startedAt = new Date(state.firstStartedAt ?? Date.now()).toISOString()
    const endedAt = new Date().toISOString()
    localStorage.removeItem(STORAGE_KEY)
    setState(EMPTY)
    if (total > 0) onStop({ startedAt, endedAt, durationSeconds: total })
  }

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState(EMPTY)
  }

  const elapsed = elapsedSeconds(state)
  const active = state.firstStartedAt !== null

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`font-mono text-6xl tabular-nums tracking-tight md:text-7xl ${
          state.running ? 'text-brand-600' : 'text-slate-800'
        }`}
      >
        {formatClock(elapsed)}
      </div>

      <div className="flex items-center gap-3">
        {!state.running ? (
          <button className="btn-primary px-8 py-3 text-base" onClick={handleStart} disabled={disabled}>
            <Play size={20} /> {active ? '继续' : '开始'}
          </button>
        ) : (
          <button className="btn-ghost px-8 py-3 text-base" onClick={handlePause}>
            <Pause size={20} /> 暂停
          </button>
        )}

        <button
          className="btn bg-rose-500 px-6 py-3 text-base text-white hover:bg-rose-600"
          onClick={handleStop}
          disabled={!active}
        >
          <Square size={18} /> 停止并保存
        </button>

        {active && !state.running && (
          <button className="btn-ghost p-3" onClick={handleReset} title="清零">
            <RotateCcw size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
