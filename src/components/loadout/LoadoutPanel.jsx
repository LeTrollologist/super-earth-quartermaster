import { useState } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { LoadoutSlot } from './LoadoutSlot'
import { ShareButton } from './ShareButton'
import { FactionSelector } from './FactionSelector'
import { PresetManager } from './PresetManager'
import { SynergyScore } from './SynergyScore'
import { SquadPanel } from '../squad/SquadPanel'
import { ROLE_COLORS } from '../../utils/squadSuggestions'
import enemiesData from '../../data/enemies.json'
import planetsData from '../../data/planets.json'
import playstylesData from '../../data/playstyles.json'

const QUARTERMASTER_QUOTES = [
  '"Democracy doesn\'t fund itself, Diver."',
  '"Pack light, hit hard."',
  '"Return the equipment. Preferably."',
  '"The Ministry expects results."',
  '"Liberty doesn\'t load itself."',
]

const ROLES = [
  { id: 'flex',          label: 'Flex' },
  { id: 'tank-buster',   label: 'Tank Buster' },
  { id: 'chaff-clear',   label: 'Chaff Clear' },
  { id: 'support-medic', label: 'Support' },
  { id: 'lone-wolf',     label: 'Lone Wolf' },
  { id: 'engineer',      label: 'Engineer' },
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

function SquadTabs() {
  const squadMembers       = useLoadoutStore(s => s.squadMembers)
  const activeSquadMember  = useLoadoutStore(s => s.activeSquadMember)
  const setActiveSquadMember = useLoadoutStore(s => s.setActiveSquadMember)
  const setSquadMemberRole = useLoadoutStore(s => s.setSquadMemberRole)

  const activeMember = squadMembers[activeSquadMember]

  return (
    <div className="px-2 pt-2 pb-1">
      {/* Member tabs */}
      <div className="flex gap-1 mb-2">
        {squadMembers.map((m, i) => {
          const roleColor = ROLE_COLORS[m.role] ?? '#6b7280'
          return (
            <button
              key={i}
              onClick={() => setActiveSquadMember(i)}
              className={`flex-1 py-1 px-1.5 rounded text-[9px] font-mono border transition-colors truncate ${
                i === activeSquadMember
                  ? 'border-hd-yellow/50 bg-hd-yellow/10 text-hd-yellow'
                  : 'border-hd-border bg-hd-surface-2 text-hd-text-dim hover:border-hd-border-2'
              }`}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: roleColor }} />
              {m.name.replace('Helldiver ', '#')}
            </button>
          )
        })}
      </div>

      {/* Role selector for active member */}
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[8px] font-mono text-hd-muted uppercase">Role:</span>
        <select
          value={activeMember.role}
          onChange={e => setSquadMemberRole(activeSquadMember, e.target.value)}
          className="bg-hd-surface-2 border border-hd-border rounded px-1.5 py-0.5 text-[9px] font-mono text-hd-text-dim outline-none focus:border-hd-yellow/50"
        >
          {ROLES.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export function LoadoutPanel() {
  const [showSquadOverview, setShowSquadOverview] = useState(false)
  const squadMode          = useLoadoutStore(s => s.squadMode)
  const soloSlots          = useLoadoutStore(s => s.slots)
  const squadMembers       = useLoadoutStore(s => s.squadMembers)
  const activeSquadMemberIdx = useLoadoutStore(s => s.activeSquadMember)
  const slots              = squadMode ? squadMembers[activeSquadMemberIdx].slots : soloSlots
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
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/70 mb-0.5">
            {squadMode ? 'Squad Loadout' : 'Diver Loadout'}
          </div>
          {squadMode && (
            <button
              onClick={() => setShowSquadOverview(true)}
              className="text-[9px] font-mono text-hd-blue hover:text-hd-blue/80 transition-colors"
            >
              Overview
            </button>
          )}
        </div>
        <div className="text-[10px] font-body italic text-hd-muted leading-tight">{quote}</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Squad tabs */}
        {squadMode && <SquadTabs />}

        {/* Loadout completion */}
        <LoadoutComplete slots={slots} />

        {/* Synergy Score */}
        <SynergyScore />

        {/* Presets */}
        <PresetManager />

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

      {/* Squad overview modal */}
      {showSquadOverview && <SquadPanel onClose={() => setShowSquadOverview(false)} />}
    </div>
  )
}
