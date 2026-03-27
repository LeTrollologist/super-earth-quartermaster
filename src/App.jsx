import { useEffect } from 'react'
import { AppShell } from './components/layout/AppShell'
import { useLoadoutStore } from './store/loadoutStore'
import { useLoadoutURL } from './hooks/useLoadoutURL'
import weaponsData   from './data/weapons.json'
import armorData     from './data/armor.json'
import stratagemData from './data/stratagems.json'
import boosterData   from './data/boosters.json'
import { decodeLoadout } from './utils/loadoutCodec'

function LoadoutURLSync() {
  useLoadoutURL()
  return null
}

export default function App() {
  return (
    <>
      <LoadoutURLSync />
      <AppShell />
    </>
  )
}
