import { useState, useEffect } from 'react'
import { fetchSheetsData, fetchTzevaadomData, mergeAndDedupe } from '../utils/dataProcessor'

export function useAlertData() {
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [sheets, tzevaadom] = await Promise.all([
        fetchSheetsData(),
        fetchTzevaadomData(),
      ])
      const merged = mergeAndDedupe(sheets, tzevaadom)
      setAllData(merged)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { allData, loading, error, lastUpdated, reload: load }
}
