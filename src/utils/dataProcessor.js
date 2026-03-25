import Papa from 'papaparse'
import { getRegion } from '../data/regionMap'

const SHEET_ID = '1EKBI0mq8LhPuMIeWDYsXJohdjpOwibAcdH0IOc3SpoE'
const SHEET_NAME = 'alerts_db'
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`

const REGION_MERGE = {
  'גליל עליון': 'גליל',
  'גליל מערבי': 'גליל',
}
function normalizeRegion(r) { return REGION_MERGE[r] || r }

// Parse dd.mm.yyyy or dd/mm/yyyy or yyyy-mm-dd → yyyy-mm-dd
function parseSheetDate(raw) {
  if (!raw) return null
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const parts = s.split(/[./]/)
  if (parts.length === 3) {
    const [d, m, y] = parts
    if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return null
}

export async function fetchSheetsData() {
  const res = await fetch(SHEET_CSV_URL, { redirect: 'follow' })
  const text = await res.text()
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })

  return data
    .map(row => {
      const city = row['ישוב'] || ''
      const rawRegion = row['איזור'] || row['אזור'] || ''
      const region = normalizeRegion(
        (rawRegion && rawRegion !== 'לא ממופה')
          ? rawRegion
          : (getRegion(city) || 'לא ממופה')
      )

      return {
        unixTime: Number(row['unix_time'] || 0),
        date: parseSheetDate(row['תאריך']),
        time: row['שעה'] || '',
        region,
        council: row['מועצה'] || '',
        city,
        eventType: row['סוג_אירוע'] || '',
        source: 'sheets',
      }
    })
    .filter(r => r.date && r.city)
}
