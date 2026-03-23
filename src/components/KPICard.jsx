export default function KPICard({ icon, label, value, sub, color = 'red' }) {
  const colors = {
    red:    'bg-[#1f0a0a] border-[#3a1010]',
    olive:  'bg-[#1a1a08] border-[#2a2a10]',
    maroon: 'bg-[#1a0a12] border-[#3a1020]',
  }

  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 ${colors[color] || colors.red}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-2xl" aria-hidden="true">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  )
}
