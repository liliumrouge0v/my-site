import { useQuery } from '@tanstack/react-query'
import { listTimeEntries } from '../lib/queries'
import StatsChart from '../components/StatsChart'
import TimeEntryList from '../components/TimeEntryList'

export default function RecordsPage() {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['time_entries'],
    queryFn: () => listTimeEntries(),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">时间记录</h1>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-400">加载中…</p>
      ) : (
        <>
          <StatsChart entries={entries} />
          <TimeEntryList entries={entries} />
        </>
      )}
    </div>
  )
}
