export default function Top10Table({ data }) {
  return (
    <div className="bg-[#141414] border border-[#2a2020] rounded-xl p-3 sm:p-5 overflow-x-auto">
      <h2 className="text-sm font-medium text-gray-300 mb-4">TOP 10 ישובים עם הכי הרבה אזעקות</h2>
      <table className="w-full text-xs sm:text-sm" aria-label="טבלת 10 הישובים עם הכי הרבה אזעקות">
        <thead>
          <tr className="text-gray-400 text-xs border-b border-[#2a2020]">
            <th scope="col" className="text-right pb-2 font-medium w-6 sm:w-8">#</th>
            <th scope="col" className="text-right pb-2 font-medium">ישוב</th>
            <th scope="col" className="text-right pb-2 font-medium">אזור</th>
            <th scope="col" className="text-left pb-2 font-medium">כמות</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.city} className="border-b border-[#1e1e1e] hover:bg-[#1a1a1a] transition-colors">
              <td className="py-1.5 sm:py-2 text-gray-400">{i + 1}</td>
              <td className="py-1.5 sm:py-2 text-white">{row.city}</td>
              <td className="py-1.5 sm:py-2">
                <span className="bg-[#2a1a1a] text-gray-300 text-[0.65rem] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                  {row.region}
                </span>
              </td>
              <td className="py-1.5 sm:py-2 text-left text-[#e85d04] font-semibold">{row.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
