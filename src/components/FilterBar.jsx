const DATE_PRESETS = [
  { label: 'היום', days: 0 },
  { label: '7 ימים', days: 7 },
  { label: '28 ימים', days: 28 },
  { label: 'הכל', days: null },
]

function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

export default function FilterBar({ filters, setFilters, regions, councils, eventTypes, cities, onReset }) {
  function selectedValues(options) {
    return Array.from(options).filter(option => option.selected).map(option => option.value)
  }

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
  const inputCls = "bg-[#1e1e1e] border border-[#333] text-white text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 focus:outline-none focus:border-[#e85d04] focus:ring-1 focus:ring-[#e85d04]"

  return (
    <div className="flex flex-col gap-3 bg-[#141414] border border-[#2a2020] rounded-xl p-3 sm:p-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="סינון מהיר לפי תקופה">
        {DATE_PRESETS.map(({ label, days }) => (
          <button
            key={label}
            onClick={() => applyPreset(days)}
            aria-pressed={active === label}
            className={`text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-1 focus:ring-offset-[#141414] ${
              active === label
                ? 'bg-[#e85d04] border-[#e85d04] text-white'
                : 'bg-[#1e1e1e] border-[#333] text-gray-400 hover:text-white hover:border-[#e85d04]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 items-center">
        <label className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-400 text-xs sm:text-sm shrink-0">מ:</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
            aria-label="מתאריך"
            className={`${inputCls} w-full`}
          />
        </label>

        <label className="flex items-center gap-1 sm:gap-2">
          <span className="text-gray-400 text-xs sm:text-sm shrink-0">עד:</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
            aria-label="עד תאריך"
            className={`${inputCls} w-full`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">אזורים</span>
          <select
            multiple
            value={filters.regions}
            onChange={e => setFilters(f => ({ ...f, regions: selectedValues(e.target.options), councils: [], city: '' }))}
            aria-label="סינון לפי אזורים"
            className={`${inputCls} min-h-24`}
          >
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span className="text-[10px] text-gray-500">אפשר לבחור כמה עם Ctrl או Cmd</span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">מועצות</span>
          <select
            multiple
            value={filters.councils}
            onChange={e => setFilters(f => ({ ...f, councils: selectedValues(e.target.options), city: '' }))}
            aria-label="סינון לפי מועצות"
            className={`${inputCls} min-h-24`}
          >
            {councils.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-[10px] text-gray-500">אפשר לבחור כמה עם Ctrl או Cmd</span>
        </label>

        <input
          type="text"
          value={filters.city}
          onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
          list="cities-datalist"
          placeholder="חיפוש ישוב..."
          aria-label="חיפוש לפי ישוב"
          className={`${inputCls} placeholder-gray-600 w-full sm:w-36`}
        />
        <datalist id="cities-datalist">
          {cities.map(c => <option key={c} value={c} />)}
        </datalist>

        <select
          value={filters.eventType}
          onChange={e => setFilters(f => ({ ...f, eventType: e.target.value }))}
          aria-label="סינון לפי סוג אירוע"
          className={inputCls}
        >
          <option value="">כל הסוגים</option>
          {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-white border border-[#333] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e85d04] focus:ring-offset-1 focus:ring-offset-[#141414]"
        >
          <span aria-hidden="true">↺</span> אפס פילטרים
        </button>
      </div>
    </div>
  )
}
