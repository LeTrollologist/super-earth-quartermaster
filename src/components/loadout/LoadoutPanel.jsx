import { useLoadoutStore } from '../../store/loadoutStore'
import { LoadoutSlot } from './LoadoutSlot'
import { ShareButton } from './ShareButton'
import { FactionSelector } from './FactionSelector'
import enemiesData from '../../data/enemies.json'
import planetsData from '../../data/planets.json'

const QUARTERMASTER_QUOTES = [
  '"Democracy doesn\'t fund itself, Diver."',
  '"Pack light, hit hard."',
  '"Return the equipment. Preferably."',
  '"The Ministry expects results."',
  '"Liberty doesn\'t load itself."',
]

function LoadoutComplete({ slots }) {
  const filled = [
    slots.primary, slots.secondary, slots.throwable, slots.armor,
    ...slots.stratagems, slots.booster
  ].filter(Boolean).length
  const total = 8
  const pct = Math.round((filled / total) * 100)
  const isComplete = filled === total

  return (
    <div className={`mx-3 my-2 p-2 rounded border text-center ${
      isComplete
        ? 'border-hd-yellow/50 bg-hd-yellow/10'
        : 'border-hd-border bg-hd-surface-2'
    }`}>
      <div className="h-1 bg-hd-faded rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'bg-hd-yellow' : 'bg-hd-yellow/50'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isComplete ? (
        <div className="text-xs font-mono text-hd-yellow tracking-widest">
          ✦ MINISTRY APPROVED ✦
        </div>
      ) : (
        <div className="text-[10px] font-mono text-hd-text-dim">
          REQUISITION {filled}/{total} ITEMS SELECTED
        </div>
      )}
    </div>
  )
}

export function LoadoutPanel() {
  const slots              = useLoadoutStore(s => s.slots)
  const activeSlot         = useLoadoutStore(s => s.activeSlot)
  const activeStrIdx       = useLoadoutStore(s => s.activeStratagemIndex)
  const setActiveSlot      = useLoadoutStore(s => s.setActiveSlot)
  const clearSlot          = useLoadoutStore(s => s.clearSlot)
  const selectedFactions   = useLoadoutStore(s => s.selectedFactions)
  const toggleFaction      = useLoadoutStore(s => s.toggleFaction)
  const selectedEnemies    = useLoadoutStore(s => s.selectedEnemies)
  const toggleEnemy        = useLoadoutStore(s => s.toggleEnemy)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const toggleCondition    = useLoadoutStore(s => s.toggleCondition)

  const quote = QUARTERMASTER_QUOTES[Math.floor(Date.now() / 60000) % QUARTERMASTER_QUOTES.length]

  const visibleEnemies = enemiesData.enemies.filter(e => selectedFactions.includes(e.faction))
  const visibleConditions = planetsData.conditions

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-3 py-2.5 border-b border-hd-border shrink-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/70 mb-0.5">
          Diver Loadout
        </div>
        <div className="text-[10px] font-body italic text-hd-muted leading-tight">{quote}</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Loadout completion */}
        <LoadoutComplete slots={slots} />

        {/* Section: Weapons */}
        <div className="px-3 pt-2 pb-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">
            ◆ Standard Issue
          </div>
        </div>
        {['primary','secondary','throwable'].map(key => (
          <LoadoutSlot
            key={key}
            slotKey={key}
            item={slots[key]}
            isActive={activeSlot === key}
            onClick={() => setActiveSlot(key)}
            onClear={() => clearSlot(key)}
          />
        ))}

        {/* Section: Armor */}
        <div className="px-3 pt-3 pb-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">
            ◆ Field Gear
          </div>
        </div>
        <LoadoutSlot
          slotKey="armor"
          item={slots.armor}
          isActive={activeSlot === 'armor'}
          onClick={() => setActiveSlot('armor')}
          onClear={() => clearSlot('armor')}
        />

        {/* Section: Stratagems */}
        <div className="px-3 pt-3 pb-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">
            ◆ Stratagems
          </div>
        </div>
        {slots.stratagems.map((strat, i) => (
          <LoadoutSlot
            key={i}
            slotKey="stratagem"
            stratagemIndex={i}
            item={strat}
            isActive={activeSlot === 'stratagem' && activeStrIdx === i}
            onClick={() => setActiveSlot('stratagem', i)}
            onClear={() => clearSlot('stratagem', i)}
          />
        ))}

        {/* Section: Booster */}
        <div className="px-3 pt-3 pb-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">
            ◆ Mission Support
          </div>
        </div>
        <LoadoutSlot
          slotKey="booster"
          item={slots.booster}
          isActive={activeSlot === 'booster'}
          onClick={() => setActiveSlot('booster')}
          onClear={() => clearSlot('booster')}
        />

        {/* Threat Assessment */}
        <div className="px-3 pt-4 pb-1">
          <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">
            ◆ Threat Assessment
          </div>
        </div>
        <FactionSelector
          factions={enemiesData.factions}
          selectedFactions={selectedFactions}
          onToggleFaction={toggleFaction}
          enemies={visibleEnemies}
          selectedEnemies={selectedEnemies}
          onToggleEnemy={toggleEnemy}
          conditions={visibleConditions}
          selectedConditions={selectedConditions}
          onToggleCondition={toggleCondition}
        />
      </div>

      {/* Share */}
      <div className="p-3 border-t border-hd-border shrink-0">
        <ShareButton />
      </div>
    </div>
  )
}
