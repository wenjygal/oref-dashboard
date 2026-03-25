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

const CITY_GROUP_PREFIXES = [
  'תל אביב',
  'ראשון לציון',
  'רמת גן',
  'הרצליה',
  'חדרה',
  'באר שבע',
  'אשדוד',
  'אשקלון',
  'צפת',
  'קריית שמונה',
  'חיפה',
  'יהוד',
  'מודיעין',
  'ירושלים',
  'רמלה',
  'לוד',
  'נהריה',
  'עכו',
  'טבריה',
  'נתניה',
]

const CITY_GROUP_ALIASES = {
  'תל אביב - דרום העיר ויפו': 'תל אביב',
  'תל אביב - עבר הירקון': 'תל אביב',
  'תל אביב - מרכז העיר': 'תל אביב',
  'תל אביב - מזרח': 'תל אביב',
  'ראשון לציון - מזרח': 'ראשון לציון',
  'ראשון לציון - מערב': 'ראשון לציון',
  'הרצליה - מרכז וגליל ים': 'הרצליה',
  'הרצליה - מערב': 'הרצליה',
  'חיפה - קריית חיים ושמואל': 'חיפה',
  'צפת - עיר': 'צפת',
  'קריית גת, כרמי גת': 'קריית גת',
}

function extractGroupedCity(city) {
  const rawCity = String(city || '').trim()
  if (!rawCity) return ''
  if (CITY_GROUP_ALIASES[rawCity]) return CITY_GROUP_ALIASES[rawCity]

  for (const prefix of CITY_GROUP_PREFIXES) {
    if (rawCity === prefix) return prefix
    if (rawCity.startsWith(`${prefix} - `)) return prefix
    if (rawCity.startsWith(`${prefix},`)) return prefix
  }

  return rawCity
}

function normalizeAuthority(council, city) {
  const rawCouncil = String(council || '').trim()
  if (rawCouncil && rawCouncil !== 'לא ממופה') return rawCouncil

  const rawCity = extractGroupedCity(city)
  if (!rawCity) return ''

  return rawCity
}

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
        date: parseSheetDate(row['תאריך']),
        time: row['שעה'] || '',
        region,
        council: normalizeAuthority(row['מועצה'], city),
        city,
        eventType: row['סוג_אירוע'] || '',
        source: 'sheets',
      }
    })
    .filter(r => r.date && r.city)
}
