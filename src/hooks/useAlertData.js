import { useState, useEffect } from 'react'
import { fetchSheetsData } from '../utils/dataProcessor'

export function useAlertData() {
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const sheets = await fetchSheetsData()
      setAllData(sheets)
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
