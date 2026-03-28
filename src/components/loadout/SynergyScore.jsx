import { useMemo } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { scoreCurrentLoadout } from '../../utils/suggestions'
import enemiesData from '../../data/enemies.json'
import playstylesData from '../../data/playstyles.json'

const DIM_LABELS = {
  faction:   'Faction',
  planet:    'Planet',
  mission:   'Mission',
  playstyle: 'Playstyle',
  loadout:   'Loadout',
}

function MiniBar({ value, label }) {
  const pct = Math.max(0, Math.min(100, value + 50)) // center at 50 since values can be negative
  const color = pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[8px] font-mono text-hd-muted w-14 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-1 bg-hd-faded rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[8px] font-mono text-hd-text-dim w-6">{value > 0 ? `+${value}` : value}</span>
    </div>
  )
}

export function SynergyScore() {
  const getActiveSlots = useLoadoutStore(s => s.getActiveSlots)
  const slots = getActiveSlots()
  const selectedFactions   = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies    = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const suggestMission     = useLoadoutStore(s => s.suggestMission)
  const selectedPlaystyle  = useLoadoutStore(s => s.selectedPlaystyle)
  const difficulty         = useLoadoutStore(s => s.difficulty)
  const synergyModes       = useLoadoutStore(s => s.synergyModes)

  const result = useMemo(() => {
    const factions = enemiesData.factions.filter(f => selectedFactions.includes(f.id))
    const enemies = enemiesData.enemies.filter(e => selectedEnemies.includes(e.id))
    const playstyle = playstylesData.find(p => p.id === selectedPlaystyle) ?? null

    const ctx = {
      factions, enemies,
      conditions: selectedConditions,
      mission: suggestMission,
      playstyle, difficulty, synergyModes,
      buildAround: null,
      currentSlots: slots,
    }

    return scoreCurrentLoadout(slots, ctx)
  }, [slots, selectedFactions, selectedEnemies, selectedConditions, suggestMission, selectedPlaystyle, difficulty, synergyModes])

  if (!result) return null

  const color = result.overall >= 65 ? 'text-green-400 border-green-600' : result.overall >= 45 ? 'text-yellow-400 border-yellow-600' : 'text-red-400 border-red-600'
  const barColor = result.overall >= 65 ? 'bg-green-500' : result.overall >= 45 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="mx-3 my-1.5 p-2 rounded border border-hd-border bg-hd-surface-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">Synergy Score</span>
        <span className={`text-[11px] font-mono font-bold border px-1.5 rounded ${color}`}>
          {result.overall}/100
        </span>
      </div>
      <div className="h-1.5 bg-hd-faded rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${result.overall}%` }} />
      </div>
      <div className="space-y-0.5">
        {Object.entries(DIM_LABELS).map(([key, label]) => (
          <MiniBar key={key} value={result.dimensions[key] ?? 0} label={label} />
        ))}
      </div>
    </div>
  )
}
