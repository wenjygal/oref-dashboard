export default function FilterBar({ filters, setFilters, regions, eventTypes, onReset }) {
  return (
    <div className="flex flex-wrap gap-3 items-center bg-[#141414] border border-[#2a2020] rounded-xl p-4">
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
  )
}
