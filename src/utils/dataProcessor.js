import Papa from 'papaparse'
import { getRegion } from '../data/regionMap'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTjrdwICr4aoVXJfz9CytIn9JV8wD1ILAylBKFjXsYAgLSOQOVew9oF49cy4nSgZfnYOa45HBFaFtxC/pub?gid=0&single=true&output=csv'
const TZEVAADOM_API = 'https://api.tzevaadom.co.il/alerts-history'

const REGION_MERGE = {
  'גליל עליון': 'גליל',
  'גליל מערבי': 'גליל',
}
function normalizeRegion(r) { return REGION_MERGE[r] || r }

const THREAT_TO_EVENT = {
  0: 'ירי רקטות וטילים',
  1: 'ירי רקטות וטילים',
  2: 'חדירת כלי טיס עוין',
  3: 'חדירת מחבלים',
  4: 'חשש לחדירת כלי טיס עוין',
  5: 'ירי רקטות וטילים',
}

// Parse dd.mm.yyyy or dd/mm/yyyy or yyyy-mm-dd → yyyy-mm-dd
function parseSheetDate(raw) {
  if (!raw) return null
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const parts = s.split(/[./]/)
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y.length === 4) return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
  }
  return null
}

// Unix timestamp → { date: 'yyyy-mm-dd', time: 'HH:MM' }
function parseUnixTs(ts) {
  const d = new Date(ts * 1000)
  const date = d.toISOString().slice(0, 10)
  const time = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
  return { date, time }
}

export async function fetchSheetsData() {
  const res = await fetch(SHEET_CSV_URL, { redirect: 'follow' })
  const text = await res.text()
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })

  return data
    .map(row => {
      // Handle both column name variants
      const city = row['ישוב'] || ''
      const rawRegion = row['איזור'] || row['אזור'] || ''
      const region = normalizeRegion(
        (rawRegion && rawRegion !== 'לא ממופה')
          ? rawRegion
          : (getRegion(city) || 'לא ממופה')
      )

      return {
        date: parseSheetDate(row['תאריך']),
        time: row['שעה'] || '',
        region,
        council: row['מועצה'] || '',
        city,
        eventType: row['סוג_אירוע'] || row['סוג'] || '',
        source: 'sheets',
      }
    })
    .filter(r => r.date && r.city)
}

export async function fetchTzevaadomData() {
  try {
    const res = await fetch(TZEVAADOM_API)
    if (!res.ok) return []
    const groups = await res.json()
    const rows = []

    for (const group of groups) {
      for (const alert of group.alerts || []) {
        if (alert.isDrill) continue
        const { date, time } = parseUnixTs(alert.time)
        const eventType = THREAT_TO_EVENT[alert.threat] || 'אזעקה'
        for (const city of alert.cities || []) {
          rows.push({
            date,
            time,
            region: normalizeRegion(getRegion(city) || 'לא ממופה'),
            council: '',
            city,
            eventType,
            source: 'tzevaadom',
          })
        }
      }
    }
    return rows
  } catch {
    return []
  }
}

export function mergeAndDedupe(sheetsRows, tzevaadomRows) {
  const seen = new Set(sheetsRows.map(r => `${r.date}|${r.time}|${r.city}`))
  const newRows = tzevaadomRows.filter(r => !seen.has(`${r.date}|${r.time}|${r.city}`))
  return [...sheetsRows, ...newRows].sort((a, b) => {
    const da = `${a.date}${a.time}`
    const db = `${b.date}${b.time}`
    return db.localeCompare(da)
  })
}
