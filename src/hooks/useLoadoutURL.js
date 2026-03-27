import { useEffect } from 'react'
import { useLoadoutStore } from '../store/loadoutStore'
import { encodeLoadout, decodeLoadout } from '../utils/loadoutCodec'
import weaponsData  from '../data/weapons.json'
import armorData    from '../data/armor.json'
import stratagemData from '../data/stratagems.json'
import boosterData  from '../data/boosters.json'

/**
 * Syncs the loadout store to/from the URL query param `?loadout=...`
 */
export function useLoadoutURL() {
  const slots    = useLoadoutStore(s => s.slots)
  const setSlot  = useLoadoutStore(s => s.setSlot)
  const setStratagemSlot = useLoadoutStore(s => s.setStratagemSlot)

  // On mount: decode from URL
  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const encoded = params.get('loadout')
    if (!encoded) return

    const decoded = decodeLoadout(encoded, {
      weapons:    weaponsData,
      armor:      armorData,
      stratagems: stratagemData,
      boosters:   boosterData,
    })
    if (!decoded) return

    if (decoded.primary)   setSlot('primary',   decoded.primary)
    if (decoded.secondary) setSlot('secondary',  decoded.secondary)
    if (decoded.throwable) setSlot('throwable',  decoded.throwable)
    if (decoded.armor)     setSlot('armor',      decoded.armor)
    if (decoded.booster)   setSlot('booster',    decoded.booster)
    decoded.stratagems.forEach((s, i) => { if (s) setStratagemSlot(i, s) })
  }, [])  // eslint-disable-line

  // On change: encode to URL (replaceState, no navigation)
  useEffect(() => {
    const encoded = encodeLoadout(slots)
    if (!encoded) return
    const url = new URL(window.location.href)
    url.searchParams.set('loadout', encoded)
    window.history.replaceState(null, '', url.toString())
  }, [slots])

  function getShareURL() {
    const encoded = encodeLoadout(slots)
    if (!encoded) return window.location.href
    const url = new URL(window.location.href)
    url.searchParams.set('loadout', encoded)
    return url.toString()
  }

  return { getShareURL }
}
