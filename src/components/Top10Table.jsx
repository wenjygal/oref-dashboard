export default function Top10Table({ data }) {
  return (
    <div className="bg-[#141414] border border-[#2a2020] rounded-xl p-5">
      <h3 className="text-sm font-medium text-gray-300 mb-4">TOP 10 ישובים עם הכי הרבה אזעקות</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs border-b border-[#2a2020]">
            <th className="text-right pb-2 font-medium w-8">#</th>
            <th className="text-right pb-2 font-medium">ישוב</th>
            <th className="text-right pb-2 font-medium">אזור</th>
            <th className="text-left pb-2 font-medium">כמות</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.city} className="border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors">
              <td className="py-2 text-gray-500">{i + 1}</td>
              <td className="py-2 text-white">{row.city}</td>
              <td className="py-2">
                <span className="bg-[#2a1a1a] text-gray-300 text-xs px-2 py-0.5 rounded-full">
                  {row.region}
                </span>
              </td>
              <td className="py-2 text-left text-[#e85d04] font-semibold">{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
