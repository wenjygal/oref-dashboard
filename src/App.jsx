import { useState, useMemo } from 'react'
import { useAlertData } from './hooks/useAlertData'
import KPICard from './components/KPICard'
import FilterBar from './components/FilterBar'
import { EventTypeDonut, RegionBarChart, TimelineChart } from './components/Charts'
import Top10Table from './components/Top10Table'

const DEFAULT_FILTERS = { dateFrom: '', dateTo: '', region: '', council: '', eventType: '', city: '' }

const SUPER_REGIONS = [
  'גוש דן', 'שרון', 'שפלה', 'ירושלים', 'חיפה', 'גליל',
  'עמקים', 'כינרת', 'גולן', 'אשדוד', 'אשקלון', 'עוטף עזה',
  'נגב', 'ים המלח', 'ערבה', 'הר חברון', 'גוש עציון',
  'מטה בנימין', 'שומרון', 'חבל מודיעין', 'שדות דן', 'חוף אשקלון', 'המשולש',
]
const SUPER_REGIONS_SET = new Set(SUPER_REGIONS)

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

  const regions = useMemo(() => {
    const inData = new Set(allData.map(r => r.region).filter(Boolean))
    return SUPER_REGIONS.filter(r => inData.has(r))
  }, [allData])

  const eventTypes = useMemo(() => {
    const s = new Set(allData.map(r => r.eventType).filter(Boolean))
    return [...s].sort()
  }, [allData])

  const baseFiltered = useMemo(() => {
    return allData.filter(r => {
      if (!r.region || !SUPER_REGIONS_SET.has(r.region)) return false
      if (filters.dateFrom && r.date < filters.dateFrom) return false
      if (filters.dateTo && r.date > filters.dateTo) return false
      if (filters.region && r.region !== filters.region) return false
      if (filters.eventType && r.eventType !== filters.eventType) return false
      return true
    })
  }, [allData, filters.dateFrom, filters.dateTo, filters.region, filters.eventType])

  const councils = useMemo(() => {
    const s = new Set(
      baseFiltered
        .map(r => r.council)
        .filter(c => c && c !== 'לא ממופה')
    )
    return [...s].sort()
  }, [baseFiltered])

  const councilFiltered = useMemo(() => {
    if (!filters.council) return baseFiltered
    return baseFiltered.filter(r => r.council === filters.council)
  }, [baseFiltered, filters.council])

  const cities = useMemo(() => {
    const s = new Set(councilFiltered.map(r => r.city).filter(Boolean))
    return [...s].sort()
  }, [councilFiltered])

  const filtered = useMemo(() => {
    if (!filters.city) return councilFiltered
    const q = filters.city.trim()
    return councilFiltered.filter(r => r.city && r.city.includes(q))
  }, [councilFiltered, filters.city])

  const totalAlerts = filtered.length
  const uniqueCities = new Set(filtered.map(r => r.city)).size
  const eventTypeCounts = count(filtered, 'eventType')
  const regionCounts = count(filtered, 'region')

  const topEventType = topEntries(eventTypeCounts, 1)[0]
  const topRegion = topEntries(
    Object.fromEntries(Object.entries(regionCounts).filter(([k]) => SUPER_REGIONS_SET.has(k))), 1
  )[0]

  const eventTypeChartData = topEntries(eventTypeCounts)
  const regionChartData = topEntries(
    Object.fromEntries(Object.entries(regionCounts).filter(([k]) => SUPER_REGIONS_SET.has(k)))
  )

  const timelineData = useMemo(() => {
    const byDate = count(filtered, 'date')
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, value]) => ({
      date: date.slice(5),
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

  const earliestDate = useMemo(() => {
    if (!allData.length) return null
    const min = allData.reduce((m, r) => (r.date && r.date < m ? r.date : m), allData[0].date || '')
    if (!min) return null
    const [y, mo, d] = min.split('-')
    return `${d}.${mo}.${y}`
  }, [allData])

  const lastUpdatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="min-h-screen bg-[#0d0d0d] px-3 py-4 sm:p-6 max-w-7xl mx-auto">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:bg-[#e85d04] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:outline-none"
      >
        דלג לתוכן הראשי
      </a>

      <header className="relative overflow-hidden mb-6 rounded-3xl border border-[#2a2020] bg-[radial-gradient(circle_at_top_right,_rgba(255,132,0,0.10),_transparent_35%),linear-gradient(180deg,#151515_0%,#101010_100%)] p-5 sm:p-7 min-h-[220px]">
        <img
          src="https://wenjygal.github.io/oref-dashboard/lion-logo.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none relative mx-auto mt-4 block w-24 opacity-40 select-none sm:absolute sm:left-6 sm:top-1/2 sm:mt-0 sm:w-64 sm:-translate-y-1/2 sm:opacity-95 lg:w-[300px]"
        />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:pl-40 lg:pl-[320px]">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-bold text-white">שאגת האריה</h1>
            <p className="text-[#ff8a00] text-sm sm:text-base mt-2">סטטיסטיקת אזעקות מתעדכנת</p>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">מתעדכן כל 4 שעות</p>
            <p className="text-gray-400 text-sm mt-2">סיכום אזעקות וניתוח סטטיסטי</p>
            <p className="text-gray-400 text-xs mt-1">
              הנתונים כוללים אזעקות צבע אדום בלבד ממערכת פיקוד העורף
              {earliestDate && ` (תחילת נתונים: ${earliestDate})`}
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            {lastUpdatedStr && (
              <span aria-live="polite" aria-atomic="true" className="text-gray-400 text-xs">
                עודכן לאחרונה ב-{lastUpdatedStr}
              </span>
            )}
            <button
              onClick={reload}
              disabled={loading}
              aria-label={loading ? 'טוען נתונים' : 'רענן נתונים'}
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-white border border-[#333] rounded-lg px-3 py-2 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-1 focus:ring-offset-[#0d0d0d]"
            >
              <span aria-hidden="true">{loading ? '...' : '↺'}</span> רענן
            </button>
          </div>
        </div>
      </header>

      <main id="main-content">
        {error && (
          <div role="alert" className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300 text-sm">
            שגיאה בטעינת נתונים: {error}
          </div>
        )}

        <div className="mb-6">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            regions={regions}
            councils={councils}
            eventTypes={eventTypes}
            cities={cities}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {loading && (
          <div role="status" aria-live="polite" className="text-center text-gray-400 py-20 text-sm">
            טוען נתונים...
          </div>
        )}

        {!loading && (
          <>
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
                label="ישובים שנשמעה בהם אזעקה"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <EventTypeDonut data={eventTypeChartData} />
              <RegionBarChart data={regionChartData} />
            </div>

            <div className="mb-4">
              <TimelineChart data={timelineData} />
            </div>

            <Top10Table data={top10Cities} />
          </>
        )}
      </main>

      <footer className="mt-8 pt-6 border-t border-[#2a2020] text-center text-xs text-gray-400 space-y-1">
        <p>האתר מציג נתונים רשמיים של פיקוד העורף. הנתונים מוצגים כפי שהתקבלו — אין אחריות לנכונותם והשימוש באתר על אחריות המשתמש בלבד.</p>
        <p>האתר נגיש לפי התקן הישראלי · פתוח לכולם · אינו שומר פרטים אישיים.</p>
        <p>
          ליצירת קשר:{' '}
          <a
            href="mailto:meimagineai@gmail.com"
            title="meimagineai@gmail.com"
            className="hover:text-white underline transition-colors focus:outline-none focus:ring-1 focus:ring-[#e85d04] rounded"
          >
            MEIMAGINEAI
          </a>
        </p>
      </footer>
    </div>
  )
}
