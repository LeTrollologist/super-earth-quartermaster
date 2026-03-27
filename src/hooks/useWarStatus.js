import { useState, useEffect } from 'react'

const API_BASE = 'https://api.helldivers2.dev'
const HEADERS = {
  'X-Super-Client':  'helldivers-loadout-builder',
  'X-Super-Contact': 'helldivers-loadout@helldivers.gg',
}

export function useWarStatus() {
  const [warData,   setWarData]   = useState(null)
  const [planets,   setPlanets]   = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      try {
        setLoading(true)
        const [warRes, planetsRes, campaignsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/war`,       { headers: HEADERS }),
          fetch(`${API_BASE}/api/v1/planets`,   { headers: HEADERS }),
          fetch(`${API_BASE}/api/v1/campaigns`, { headers: HEADERS }),
        ])

        if (!warRes.ok || !planetsRes.ok || !campaignsRes.ok) {
          throw new Error('API response error')
        }

        const [war, pls, camps] = await Promise.all([
          warRes.json(),
          planetsRes.json(),
          campaignsRes.json(),
        ])

        if (!cancelled) {
          setWarData(war)
          setPlanets(pls)
          setCampaigns(camps)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    // Refresh every 5 minutes (respect rate limits: 5 req / 10s)
    const interval = setInterval(fetchAll, 5 * 60 * 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Derive active factions from campaign planet names/factions
  const activeFactions = [...new Set(
    campaigns.map(c => {
      const planet = planets.find(p => p.index === c.planet?.index)
      return planet?.currentOwner?.toLowerCase()
    }).filter(Boolean)
  )]

  return { warData, planets, campaigns, activeFactions, loading, error }
}
