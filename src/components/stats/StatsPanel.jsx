import { useLoadoutStore } from '../../store/loadoutStore'
import { WeaponStats } from './WeaponStats'
import { ArmorStats } from './ArmorStats'
import { StratagemStats } from './StratagemStats'
import { BoosterStats } from './BoosterStats'
import { ComparePanel } from './ComparePanel'
import {
  weaponEffectivenessScore,
  stratagemEffectivenessScore,
  recommendedPassivesForConditions,
  recommendedPassivesForFactions,
} from '../../utils/statCalc'
import enemiesData from '../../data/enemies.json'
import passivesData from '../../data/passives.json'
import planetsData from '../../data/planets.json'

function EmptyState({ activeSlot }) {
  const messages = {
    primary:   'Select a primary weapon to view its stats',
    secondary: 'Select a secondary weapon to view its stats',
    throwable: 'Select a throwable to view its stats',
    armor:     'Select armor to view its stats',
    stratagem: 'Select a stratagem to view its stats',
    booster:   'Select a booster to view its effect',
  }
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40">
      <div className="text-4xl mb-3">⚔</div>
      <div className="font-display text-hd-yellow font-semibold mb-1">No Item Selected</div>
      <div className="text-xs text-hd-text-dim font-body">
        {messages[activeSlot] ?? 'Click a loadout slot then select an item'}
      </div>
    </div>
  )
}

export function StatsPanel() {
  const hoveredItem      = useLoadoutStore(s => s.hoveredItem)
  const slots            = useLoadoutStore(s => s.slots)
  const activeSlot       = useLoadoutStore(s => s.activeSlot)
  const compareMode      = useLoadoutStore(s => s.compareMode)
  const compareItems     = useLoadoutStore(s => s.compareItems)
  const selectedFactions = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies  = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)

  const factions   = enemiesData.factions.filter(f => selectedFactions.includes(f.id))
  const enemies    = enemiesData.enemies.filter(e => selectedEnemies.includes(e.id))
  const conditions = planetsData.conditions.filter(c => selectedConditions.includes(c.id))

  const recPassives = [
    ...recommendedPassivesForConditions(conditions, passivesData),
    ...recommendedPassivesForFactions(factions, passivesData),
  ]

  // Active item: hover > selected slot item
  const slotItem = activeSlot === 'stratagem'
    ? slots.stratagems[useLoadoutStore.getState().activeStratagemIndex]
    : slots[activeSlot]
  const displayItem = hoveredItem ?? slotItem

  const effectScore = (() => {
    if (!displayItem) return null
    if (displayItem.fireRate !== undefined || displayItem.blastRadius !== undefined) {
      return weaponEffectivenessScore(displayItem, enemies, factions)
    }
    if (displayItem.sequence !== undefined) {
      return stratagemEffectivenessScore(displayItem, enemies, factions)
    }
    return null
  })()

  const renderStats = (item) => {
    if (!item) return null
    // Weapon / throwable
    if (item.fireRate !== undefined || item.blastRadius !== undefined) {
      return <WeaponStats weapon={item} effectivenessScore={effectScore} />
    }
    // Stratagem
    if (item.sequence !== undefined) {
      return <StratagemStats stratagem={item} effectivenessScore={effectScore} />
    }
    // Armor
    if (item.armorRating !== undefined) {
      return <ArmorStats armor={item} recommendedPassives={recPassives} />
    }
    // Booster
    if (item.effect !== undefined) {
      return <BoosterStats booster={item} />
    }
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-hd-border shrink-0">
        <span className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70">
          {compareMode ? 'Compare' : 'Stats'}
        </span>
        {compareMode && (
          <span className="text-xs text-hd-text-dim font-body">Click items to add to comparison</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {compareMode ? (
          <ComparePanel items={compareItems} />
        ) : displayItem ? (
          renderStats(displayItem)
        ) : (
          <EmptyState activeSlot={activeSlot} />
        )}
      </div>
    </div>
  )
}
