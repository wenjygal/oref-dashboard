import { useState, useMemo } from 'react'
import { useAlertData } from './hooks/useAlertData'
import KPICard from './components/KPICard'
import FilterBar from './components/FilterBar'
import { EventTypeDonut, RegionBarChart, TimelineChart } from './components/Charts'
import Top10Table from './components/Top10Table'

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '', region: '', eventType: '' }

function count(arr, key) {
  return arr.reduce((acc, r) => {
    const v = r[key] || 'לא ידוע'
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})
}

function topEntries(obj, n = 10) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }))
}

export default function App() {
  const { allData, loading, error, lastUpdated, reload } = useAlertData()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  // Derive unique filter options from full dataset
  const regions = useMemo(() => {
    const s = new Set(allData.map(r => r.region).filter(Boolean).filter(r => r !== 'לא ממופה'))
    return [...s].sort()
  }, [allData])

  const eventTypes = useMemo(() => {
    const s = new Set(allData.map(r => r.eventType).filter(Boolean))
    return [...s].sort()
  }, [allData])

  // Filtered data
  const filtered = useMemo(() => {
    return allData.filter(r => {
      if (!r.region || r.region === 'לא ממופה') return false
      if (filters.dateFrom && r.date < filters.dateFrom) return false
      if (filters.dateTo && r.date > filters.dateTo) return false
      if (filters.region && r.region !== filters.region) return false
      if (filters.eventType && r.eventType !== filters.eventType) return false
      return true
    })
  }, [allData, filters])

  // KPIs
  const totalAlerts = filtered.length
  const uniqueCities = new Set(filtered.map(r => r.city)).size
  const eventTypeCounts = count(filtered, 'eventType')
  const regionCounts = count(filtered, 'region')

  const topEventType = topEntries(eventTypeCounts, 1)[0]
  const topRegion = topEntries(
    Object.fromEntries(Object.entries(regionCounts).filter(([k]) => k !== 'לא ממופה')), 1
  )[0]

  // Chart data
  const eventTypeChartData = topEntries(eventTypeCounts)
  const regionChartData = topEntries(
    Object.fromEntries(Object.entries(regionCounts).filter(([k]) => k !== 'לא ממופה'))
  )

  const timelineData = useMemo(() => {
    const byDate = count(filtered, 'date')
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({
      date: date.slice(5), // MM-DD
      value,
    }))
  }, [filtered])

  const top10Cities = useMemo(() => {
    const cityMap = {}
    filtered.forEach(r => {
      if (!r.city) return
      if (!cityMap[r.city]) cityMap[r.city] = { city: r.city, region: r.region, count: 0 }
      cityMap[r.city].count++
    })
    return Object.values(cityMap).sort((a, b) => b.count - a.count).slice(0, 10)
  }, [filtered])

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="min-h-screen bg-[#0d0d0d] p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">מצב התראות IL</h1>
          <p className="text-gray-400 text-sm mt-1">סיכום התראות וניתוח סטטיסטי</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdatedStr && (
            <span className="text-gray-400 text-xs">עודכן לאחרונה ב-{lastUpdatedStr}</span>
          )}
          <button
            onClick={reload}
            disabled={loading}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-[#333] rounded-lg px-3 py-2 transition-colors disabled:opacity-40"
          >
            {loading ? '...' : '↺'} רענן
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300 text-sm">
          שגיאה בטעינת נתונים: {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          regions={regions}
          eventTypes={eventTypes}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="text-center text-gray-500 py-20 text-sm">טוען נתונים...</div>
      )}

      {!loading && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              icon="🔥"
              label="סוג אירוע נפוץ"
              value={topEventType?.name || '—'}
              sub={topEventType ? `${topEventType.value.toLocaleString()} פעמים` : ''}
              color="red"
            />
            <KPICard
              icon="🛡️"
              label="האזור הכי מופגז"
              value={topRegion?.name || '—'}
              sub={topRegion ? `${topRegion.value.toLocaleString()} אזעקות` : ''}
              color="olive"
            />
            <KPICard
              icon="📍"
              label="ישובים שנפגעו"
              value={uniqueCities.toLocaleString()}
              color="red"
            />
            <KPICard
              icon="🔔"
              label="מס׳ כ אזעקות"
              value={totalAlerts.toLocaleString()}
              color="maroon"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <EventTypeDonut data={eventTypeChartData} />
            <RegionBarChart data={regionChartData} />
          </div>

          {/* Timeline */}
          <div className="mb-4">
            <TimelineChart data={timelineData} />
          </div>

          {/* Top 10 */}
          <Top10Table data={top10Cities} />
        </>
      )}

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-[#2a2020] text-center text-xs text-gray-500 space-y-1">
        <p>האתר מציג נתונים רשמיים של פיקוד העורף. הנתונים מוצגים כפי שהתקבלו — אין אחריות לנכונותם והשימוש באתר על אחריות המשתמש בלבד.</p>
        <p>האתר נגיש לפי התקן הישראלי · פתוח לכולם · אינו שומר פרטים אישיים.</p>
        <p>ליצירת קשר: <a href="mailto:meimagineai@gmail.com" className="text-gray-400 hover:text-white underline transition-colors">MEIMAGINEAI</a></p>
      </footer>
    </div>
  )
}
