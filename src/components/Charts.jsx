import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const COLORS = ['#e85d04', '#f48c06', '#dc2626', '#b45309', '#7c3aed', '#0891b2', '#059669']

const tooltipStyle = {
  backgroundColor: '#1a1010',
  border: '1px solid #3a2020',
  borderRadius: 8,
  color: '#e5e5e5',
  fontSize: 13,
}
const tooltipItemStyle = { color: '#e5e5e5' }
const tooltipLabelStyle = { color: '#aaa', marginBottom: 4 }

export function EventTypeDonut({ data }) {
  return (
    <div className="bg-[#141414] border border-[#2a2020] rounded-xl p-3 sm:p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4">פילוח לפי סוג אירוע</h2>
      <div className="h-72 sm:h-72">
        <ResponsiveContainer width="100%" height="100%" aria-label="גרף עוגה: פילוח אזעקות לפי סוג אירוע">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="40%"
              innerRadius={55}
              outerRadius={80}
              dataKey="value"
              nameKey="name"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} formatter={(v, n) => [v.toLocaleString(), n]} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 16 }}
              formatter={v => <span style={{ color: '#ccc', fontSize: 12, maxWidth: 160, wordBreak: 'break-word' }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function RegionBarChart({ data }) {
  return (
    <div className="bg-[#141414] border border-[#2a2020] rounded-xl p-3 sm:p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4">אזעקות לפי אזור</h2>
      <div className="h-44 sm:h-60">
        <ResponsiveContainer width="100%" height="100%" aria-label="גרף עמודות: אזעקות לפי אזור גיאוגרפי">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} padding={{ left: 20, right: 10 }} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: 'rgba(232,93,4,0.1)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function TimelineChart({ data }) {
  const tickInterval = Math.max(0, Math.ceil(data.length / 12) - 1)
  return (
    <div className="bg-[#141414] border border-[#2a2020] rounded-xl p-3 sm:p-5">
      <h2 className="text-sm font-medium text-gray-300 mb-4">אזעקות לפי תאריך</h2>
      <div className="h-40 sm:h-56">
        <ResponsiveContainer width="100%" height="100%" aria-label="גרף עמודות: אזעקות לפי תאריך">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2020" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} interval={tickInterval} padding={{ left: 20, right: 10 }} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Bar dataKey="value" fill="#e85d04" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
