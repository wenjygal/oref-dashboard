const DATE_PRESETS = [
  { label: 'היום', days: 0 },
  { label: '7 ימים', days: 7 },
  { label: '28 ימים', days: 28 },
  { label: 'הכל', days: null },
]

function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

export default function FilterBar({ filters, setFilters, regions, eventTypes, onReset }) {
  function applyPreset(days) {
    if (days === null) {
      setFilters(f => ({ ...f, dateFrom: '', dateTo: '' }))
      return
    }
    const today = new Date()
    const from = days === 0 ? today : new Date(today)
    if (days > 0) from.setDate(today.getDate() - (days - 1))
    setFilters(f => ({ ...f, dateFrom: toDateStr(from), dateTo: toDateStr(today) }))
  }

  function activePreset() {
    const today = toDateStr(new Date())
    if (!filters.dateFrom && !filters.dateTo) return 'הכל'
    if (filters.dateFrom === today && filters.dateTo === today) return 'היום'
    if (filters.dateTo === today) {
      const from = new Date(filters.dateFrom)
      const diff = Math.round((new Date(today) - from) / 86400000) + 1
      if (diff === 7) return '7 ימים'
      if (diff === 28) return '28 ימים'
    }
    return null
  }

  const active = activePreset()

  return (
    <div className="flex flex-col gap-3 bg-[#141414] border border-[#2a2020] rounded-xl p-4">
      {/* Quick date presets */}
      <div className="flex flex-wrap gap-2">
        {DATE_PRESETS.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => applyPreset(days)}
            className={`text-sm px-4 py-1.5 rounded-lg border transition-colors ${
              active === label
                ? 'bg-[#e85d04] border-[#e85d04] text-white'
                : 'bg-[#1e1e1e] border-[#333] text-gray-400 hover:text-white hover:border-[#e85d04]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-3 items-center">
      {/* Date from */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">מ:</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
          className="bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#e85d04]"
        />
      </div>

      {/* Date to */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm">עד:</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
          className="bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#e85d04]"
        />
      </div>

      {/* Region */}
      <select
        value={filters.region}
        onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}
        className="bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#e85d04]"
      >
        <option value="">כל האזורים</option>
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>

      {/* Event type */}
      <select
        value={filters.eventType}
        onChange={e => setFilters(f => ({ ...f, eventType: e.target.value }))}
        className="bg-[#1e1e1e] border border-[#333] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#e85d04]"
      >
        <option value="">כל הסוגים</option>
        {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white border border-[#333] rounded-lg px-3 py-2 transition-colors"
      >
        ↺ אפס פילטרים
      </button>
    </div>
    </div>
  )
}
