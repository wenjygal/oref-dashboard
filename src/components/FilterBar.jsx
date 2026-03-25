import { useState } from 'react'

const DATE_PRESETS = [
  { label: 'היום', days: 0 },
  { label: '7 ימים', days: 7 },
  { label: '28 ימים', days: 28 },
  { label: 'הכל', days: null },
]

function toDateStr(date) {
  return date.toISOString().slice(0, 10)
}

function MultiSelectField({ label, values, selected, onToggle, onClear }) {
  const [open, setOpen] = useState(false)
  const selectedLabel = selected.length ? `${selected.length} נבחרו` : `כל ה${label}`

  return (
    <div className="relative flex flex-col gap-1">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="rounded-lg border border-[#333] bg-[#1e1e1e]">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="flex h-[38px] w-full items-center justify-between gap-2 px-3 py-2 text-right text-white text-xs sm:h-[42px] sm:text-sm"
        >
          <span className="truncate">{selectedLabel}</span>
          <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full z-30 mt-2 w-full min-w-[240px] rounded-lg border border-[#333] bg-[#1e1e1e] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">אפשר לבחור כמה בלחיצה רגילה</span>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-[10px] text-[#ff8a00] hover:text-white"
                >
                  נקה
                </button>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {values.map(value => {
                const checked = selected.includes(value)
                return (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs sm:text-sm transition-colors ${
                      checked ? 'bg-[#2a1a0f] text-white' : 'text-gray-300 hover:bg-[#171717]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(value)}
                      className="h-4 w-4 accent-[#e85d04]"
                    />
                    <span className="truncate">{value}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FilterBar({ filters, setFilters, regions, councils, eventTypes, cities, onReset }) {
  function toggleSelection(list, value) {
    return list.includes(value)
      ? list.filter(item => item !== value)
      : [...list, value]
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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

        <select
          value={filters.eventType}
          onChange={e => setFilters(f => ({ ...f, eventType: e.target.value }))}
          aria-label="סינון לפי סוג אירוע"
          className={`${inputCls} w-full`}
        >
          <option value="">כל הסוגים</option>
          {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <input
          type="text"
          value={filters.city}
          onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}
          list="cities-datalist"
          placeholder="חיפוש ישוב..."
          aria-label="חיפוש לפי ישוב"
          className={`${inputCls} placeholder-gray-600 w-full`}
        />
        <datalist id="cities-datalist">
          {cities.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <MultiSelectField
          label="אזורים"
          values={regions}
          selected={filters.regions}
          onToggle={region => setFilters(f => ({ ...f, regions: toggleSelection(f.regions, region), councils: [], city: '' }))}
          onClear={() => setFilters(f => ({ ...f, regions: [], councils: [], city: '' }))}
        />

        <MultiSelectField
          label="מועצות וערים"
          values={councils}
          selected={filters.councils}
          onToggle={council => setFilters(f => ({ ...f, councils: toggleSelection(f.councils, council), city: '' }))}
          onClear={() => setFilters(f => ({ ...f, councils: [], city: '' }))}
        />
      </div>

      <div className="flex justify-start">
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
