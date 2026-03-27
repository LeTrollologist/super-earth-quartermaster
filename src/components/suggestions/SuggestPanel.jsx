import { useState, useMemo } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { suggestLoadout } from '../../utils/suggestions'
import { APBadge } from '../ui/APBadge'
import { CategoryBadge } from '../ui/CategoryBadge'
import { DamageTypeBadge } from '../ui/DamageTypeBadge'
import { ArrowSequence } from '../ui/ArrowSequence'
import { WARBONDS, WARBOND_ORDER } from '../../constants/warbonds'
import weaponsData    from '../../data/weapons.json'
import armorData      from '../../data/armor.json'
import stratagemData  from '../../data/stratagems.json'
import boosterData    from '../../data/boosters.json'
import passivesData   from '../../data/passives.json'
import enemiesData    from '../../data/enemies.json'
import planetsData    from '../../data/planets.json'
import missionsData   from '../../data/missions.json'
import playstylesData from '../../data/playstyles.json'

// All items flattened for build-around search
const ALL_ITEMS = [
  ...weaponsData.primaries.map(i => ({ ...i, _slot: 'primary' })),
  ...weaponsData.secondaries.map(i => ({ ...i, _slot: 'secondary' })),
  ...weaponsData.throwables.map(i => ({ ...i, _slot: 'throwable' })),
  ...armorData.map(i => ({ ...i, _slot: 'armor' })),
  ...stratagemData.map(i => ({ ...i, _slot: 'stratagem' })),
]

// ── Warbond dot ───────────────────────────────────────────────────────────────
function WarbondDot({ warbond }) {
  if (!warbond) return null
  const wb = WARBONDS[warbond]
  if (!wb) return null
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[9px] font-mono"
      style={{ color: wb.color + 'cc' }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: wb.color }} />
      {wb.label}
    </span>
  )
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score, locked }) {
  if (locked) return (
    <span className="text-[9px] font-mono text-hd-yellow/70 border border-hd-yellow/30 px-1 rounded">
      ◉ ANCHOR
    </span>
  )
  const color = score >= 70 ? 'text-green-400 border-green-600' : score >= 45 ? 'text-yellow-400 border-yellow-600' : 'text-red-400 border-red-600'
  return (
    <span className={`text-[9px] font-mono border px-1 rounded ${color}`}>
      {score}/100
    </span>
  )
}

// ── Suggested item row ────────────────────────────────────────────────────────
function SuggestedItem({ label, scored, alternatives = [], onEquip }) {
  if (!scored) return null
  const { item, score, rationale, locked } = scored
  const wb = item.warbond ? WARBONDS[item.warbond] : null
  const wbColor = wb?.color

  return (
    <div
      className="border border-hd-border rounded overflow-hidden"
      style={wbColor ? { borderLeftColor: wbColor, borderLeftWidth: '3px' } : {}}
    >
      {/* Main row */}
      <div className="flex items-start gap-2.5 p-2.5 bg-hd-surface-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 shrink-0">
              {label}
            </div>
            <ScoreBadge score={score} locked={locked} />
            {item.warbond && <WarbondDot warbond={item.warbond} />}
          </div>

          <div className="font-display font-semibold text-sm text-hd-yellow leading-tight mb-1.5">
            {item.name}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.category   && <CategoryBadge category={item.category} />}
            {item.apTier     && <APBadge tier={item.apTier} />}
            {item.damageType && item.damageType !== 'None' && <DamageTypeBadge type={item.damageType} />}
            {item.type && !item.category && <CategoryBadge category={item.type} />}
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 text-[10px] font-mono text-hd-text-dim mb-1.5">
            {item.damage > 0      && <span>DMG <span className="text-hd-text">{item.damage}</span></span>}
            {item.dps > 0         && <span>DPS <span className="text-hd-text">{item.dps}</span></span>}
            {item.fireRate > 0    && <span>RPM <span className="text-hd-text">{item.fireRate}</span></span>}
            {item.armorRating     && <span>ARM <span className="text-hd-text">{item.armorRating}</span></span>}
            {item.speed           && <span>SPD <span className="text-hd-text">{item.speed}</span></span>}
            {item.cooldown        && <span>CD <span className="text-hd-text">{item.cooldown}s</span></span>}
          </div>

          {item.passive && (
            <div className="text-[10px] font-mono text-hd-yellow/80 mb-1.5">⚡ {item.passive}</div>
          )}
          {item.sequence && (
            <div className="mb-1.5"><ArrowSequence sequence={item.sequence} /></div>
          )}
          {item.effect && !item.sequence && (
            <div className="text-[10px] font-mono text-teal-400 mb-1.5">{item.effect}</div>
          )}

          {/* Rationale */}
          <div className="space-y-0.5 mb-2">
            {rationale.map((r, i) => (
              <div key={i} className="flex items-start gap-1 text-[10px] font-body text-green-400">
                <span className="shrink-0 mt-px">✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

          {/* Alternatives (always visible, chip row) */}
          {alternatives.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              <span className="text-[9px] font-mono text-hd-muted self-center">alt:</span>
              {alternatives.map(alt => (
                <button
                  key={alt.item.id}
                  onClick={() => onEquip?.(alt.item)}
                  className="px-1.5 py-0.5 text-[9px] font-mono border border-hd-border rounded text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow transition-colors"
                  title={`Score: ${alt.score}/100`}
                >
                  {alt.item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Equip button */}
        <button
          onClick={() => onEquip?.(item)}
          className="shrink-0 self-start text-[9px] font-mono border border-hd-yellow/40 text-hd-yellow/70 hover:border-hd-yellow hover:text-hd-yellow px-2 py-1 rounded transition-colors"
        >
          EQUIP
        </button>
      </div>
    </div>
  )
}

// ── Apply button ──────────────────────────────────────────────────────────────
function ApplyButton({ suggestion, onApply, label = '◈ APPLY FULL LOADOUT' }) {
  const [applied, setApplied] = useState(false)
  function handle() {
    onApply(suggestion)
    setApplied(true)
    setTimeout(() => setApplied(false), 2500)
  }
  return (
    <button
      onClick={handle}
      className={`w-full py-2.5 font-mono text-sm border-2 rounded transition-all ${
        applied
          ? 'border-green-600 bg-green-900/30 text-green-400'
          : 'border-hd-yellow text-hd-bg bg-hd-yellow hover:bg-hd-yellow-dim'
      }`}
    >
      {applied ? '✦ REQUISITION SUBMITTED ✦' : label}
    </button>
  )
}

// ── Inline faction/enemy/condition selector ───────────────────────────────────
function ThreatSelector() {
  const selectedFactions   = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies    = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const toggleFaction      = useLoadoutStore(s => s.toggleFaction)
  const toggleEnemy        = useLoadoutStore(s => s.toggleEnemy)
  const toggleCondition    = useLoadoutStore(s => s.toggleCondition)

  const [showEnemies, setShowEnemies] = useState(false)
  const [showConds,   setShowConds]   = useState(false)

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">
        Threat Assessment
      </div>

      {/* Factions */}
      <div className="flex gap-1.5 flex-wrap">
        {enemiesData.factions.map(f => (
          <button
            key={f.id}
            onClick={() => toggleFaction(f.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
              selectedFactions.includes(f.id)
                ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow'
                : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.name}</span>
          </button>
        ))}
      </div>

      {/* Enemy types (collapsible) */}
      {selectedFactions.length > 0 && (
        <div>
          <button
            onClick={() => setShowEnemies(v => !v)}
            className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors"
          >
            {showEnemies ? '▼' : '▶'} SPECIFIC ENEMIES
            {selectedEnemies.length > 0 && ` (${selectedEnemies.length})`}
          </button>
          {showEnemies && (
            <div className="mt-1 flex flex-wrap gap-1">
              {enemiesData.enemies
                .filter(e => selectedFactions.includes(e.faction))
                .map(e => (
                  <button
                    key={e.id}
                    onClick={() => toggleEnemy(e.id)}
                    className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${
                      selectedEnemies.includes(e.id)
                        ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow'
                        : 'border-hd-border text-hd-muted hover:border-hd-border-2'
                    }`}
                  >
                    {e.name} <span className="opacity-50">AP{e.armorTier}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Planet conditions (collapsible) */}
      <div>
        <button
          onClick={() => setShowConds(v => !v)}
          className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors"
        >
          {showConds ? '▼' : '▶'} PLANET CONDITIONS
          {selectedConditions.length > 0 && ` (${selectedConditions.length})`}
        </button>
        {showConds && (
          <div className="mt-1 flex flex-wrap gap-1">
            {planetsData.conditions.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCondition(c.id)}
                className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${
                  selectedConditions.includes(c.id)
                    ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow'
                    : 'border-hd-border text-hd-muted hover:border-hd-border-2'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Stratagem limits ──────────────────────────────────────────────────────────
function StratagemLimits() {
  const stratagemLimits        = useLoadoutStore(s => s.stratagemLimits)
  const stratagemLimitsEnabled = useLoadoutStore(s => s.stratagemLimitsEnabled)
  const setStratagemLimit      = useLoadoutStore(s => s.setStratagemLimit)
  const toggleStratagemLimits  = useLoadoutStore(s => s.toggleStratagemLimits)

  const categories = ['Orbital', 'Eagle', 'Support Weapon', 'Backpack', 'Sentry', 'Emplacement', 'Vehicle']
  const totalAllocated = categories.reduce((sum, cat) => sum + (stratagemLimits[cat] ?? 0), 0)
  const remaining = 4 - totalAllocated

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">
          Stratagem Allocation
        </div>
        <button
          onClick={toggleStratagemLimits}
          className={`text-[9px] font-mono border px-1.5 py-0.5 rounded transition-colors ${
            stratagemLimitsEnabled
              ? 'border-hd-yellow/60 bg-hd-yellow/10 text-hd-yellow'
              : 'border-hd-border text-hd-muted hover:border-hd-border-2'
          }`}
        >
          {stratagemLimitsEnabled ? 'MANUAL' : 'AUTO'}
        </button>
      </div>

      {!stratagemLimitsEnabled ? (
        <div className="text-[9px] font-mono text-hd-muted italic">
          Best 4 by synergy score — no category constraints
        </div>
      ) : (
        <>
          {/* Budget bar */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-6 h-1.5 rounded-sm transition-colors ${i < totalAllocated ? 'bg-hd-yellow' : 'bg-hd-faded'}`} />
              ))}
            </div>
            <span className={`text-[9px] font-mono ${totalAllocated >= 4 ? 'text-hd-yellow' : 'text-hd-text-dim'}`}>
              {totalAllocated}/4 slots
            </span>
          </div>

          <div className="space-y-1.5">
            {categories.map(cat => {
              const val = stratagemLimits[cat] ?? 0
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className="text-[9px] font-mono text-hd-text-dim w-24 shrink-0 truncate">{cat}</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setStratagemLimit(cat, Math.max(0, val - 1))}
                      disabled={val === 0}
                      className="w-5 h-5 text-[10px] font-mono border border-hd-border rounded transition-colors disabled:opacity-25 hover:enabled:border-hd-border-2 text-hd-text-dim"
                    >
                      −
                    </button>
                    <span className={`text-[10px] font-mono w-4 text-center ${val > 0 ? 'text-hd-yellow' : 'text-hd-muted'}`}>
                      {val}
                    </span>
                    <button
                      onClick={() => setStratagemLimit(cat, val + 1)}
                      disabled={remaining <= 0}
                      className="w-5 h-5 text-[10px] font-mono border border-hd-border rounded transition-colors disabled:opacity-25 hover:enabled:border-hd-border-2 text-hd-text-dim"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Synergy mode toggles ──────────────────────────────────────────────────────
function SynergyModes() {
  const synergyModes     = useLoadoutStore(s => s.synergyModes)
  const toggleSynergyMode = useLoadoutStore(s => s.toggleSynergyMode)

  const modes = [
    { key: 'faction',   label: 'Faction', desc: 'vs selected enemies/factions' },
    { key: 'planet',    label: 'Planet',  desc: 'suit selected conditions' },
    { key: 'mission',   label: 'Mission', desc: 'suit selected mission type' },
    { key: 'playstyle', label: 'Style',   desc: 'match selected playstyle' },
    { key: 'loadout',   label: 'Loadout', desc: 'complement other gear' },
  ]

  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">
        Synergy Modes
      </div>
      <div className="space-y-1">
        {modes.map(m => (
          <div key={m.key} className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-hd-text-dim">{m.label}</span>
              <span className="text-[9px] font-mono text-hd-muted ml-1.5">{m.desc}</span>
            </div>
            <button
              onClick={() => toggleSynergyMode(m.key)}
              className={`text-[9px] font-mono border px-1.5 py-0.5 rounded transition-colors ${
                synergyModes[m.key]
                  ? 'border-green-600 bg-green-900/20 text-green-400'
                  : 'border-hd-border text-hd-muted'
              }`}
            >
              {synergyModes[m.key] ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Owned warbonds filter ─────────────────────────────────────────────────────
function OwnedWarbonds() {
  const ownedWarbonds    = useLoadoutStore(s => s.ownedWarbonds)
  const toggleOwnedWarbond = useLoadoutStore(s => s.toggleOwnedWarbond)
  const setAllWarbondsOwned = useLoadoutStore(s => s.setAllWarbondsOwned)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">
          Owned Warbonds
        </div>
        <button
          onClick={setAllWarbondsOwned}
          className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors"
        >
          All
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {WARBOND_ORDER.map(wb => {
          const info = WARBONDS[wb]
          const owned = ownedWarbonds.has(wb)
          return (
            <button
              key={wb}
              onClick={() => toggleOwnedWarbond(wb)}
              style={owned ? { backgroundColor: info.color + '25', borderColor: info.color + '80', color: info.color } : {}}
              className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${
                owned ? '' : 'border-hd-border text-hd-muted opacity-40'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
              {info.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Build Around item search ──────────────────────────────────────────────────
function AnchorSearch({ onSelect }) {
  const [query, setQuery]     = useState('')
  const [focused, setFocused] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_ITEMS.filter(i => i.name.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search any item to anchor around..."
        className="w-full bg-hd-surface-2 border border-hd-border rounded px-3 py-1.5 text-xs font-mono text-hd-text placeholder-hd-muted focus:outline-none focus:border-hd-yellow/50 transition-colors"
      />
      {focused && results.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-0.5 bg-hd-surface border border-hd-border rounded shadow-xl max-h-48 overflow-y-auto">
          {results.map(item => (
            <button
              key={item.id}
              onMouseDown={() => { onSelect(item, item._slot); setQuery('') }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-hd-surface-2 transition-colors"
            >
              <span className="text-xs font-display text-hd-text truncate flex-1">{item.name}</span>
              <span className="text-[9px] font-mono text-hd-text-dim shrink-0">{item._slot}</span>
              {item.warbond && <WarbondDot warbond={item.warbond} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export function SuggestPanel({ onClose }) {
  const selectedFactions   = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies    = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const slots              = useLoadoutStore(s => s.slots)
  const stratagemLimits        = useLoadoutStore(s => s.stratagemLimits)
  const stratagemLimitsEnabled = useLoadoutStore(s => s.stratagemLimitsEnabled)
  const synergyModes           = useLoadoutStore(s => s.synergyModes)
  const ownedWarbonds      = useLoadoutStore(s => s.ownedWarbonds)
  const setBuildAroundItem = useLoadoutStore(s => s.setBuildAroundItem)
  const clearBuildAround   = useLoadoutStore(s => s.clearBuildAround)
  const buildAroundItem    = useLoadoutStore(s => s.buildAroundItem)
  const selectedPlaystyle  = useLoadoutStore(s => s.selectedPlaystyle)
  const setSelectedPlaystyle = useLoadoutStore(s => s.setSelectedPlaystyle)
  const setSlot            = useLoadoutStore(s => s.setSlot)
  const setStratagemSlot   = useLoadoutStore(s => s.setStratagemSlot)

  const [tab,        setTab]        = useState('suggest')   // 'suggest' | 'build'
  const [mission,    setMission]    = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [showWarbonds,  setShowWarbonds]  = useState(false)
  const [showPlaystyle,   setShowPlaystyle]   = useState(false)

  const factions   = enemiesData.factions.filter(f => selectedFactions.includes(f.id))
  const enemies    = enemiesData.enemies.filter(e => selectedEnemies.includes(e.id))
  const conditions = planetsData.conditions.filter(c => selectedConditions.includes(c.id))
  const playstyle  = playstylesData.find(p => p.id === selectedPlaystyle) ?? null

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      const result = suggestLoadout({
        weapons: weaponsData,
        armor: armorData,
        stratagems: stratagemData,
        boosters: boosterData,
        passivesData,
        factions,
        enemies,
        conditions: selectedConditions,
        mission: mission?.id ?? null,
        playstyle,
        stratagemLimits,
        stratagemLimitsEnabled,
        buildAround: buildAroundItem,
        currentSlots: slots,
        synergyModes,
        ownedWarbonds,
      })
      setSuggestion(result)
      setGenerating(false)
    }, 350)
  }

  function equipItem(item, slotType) {
    if (slotType === 'stratagem') {
      const emptyIdx = slots.stratagems.findIndex(s => s === null)
      setStratagemSlot(emptyIdx >= 0 ? emptyIdx : 0, item)
    } else if (slotType) {
      setSlot(slotType, item)
    }
  }

  function equipFromSuggestion(scored, slotType) {
    if (!scored) return
    equipItem(scored.item, slotType)
  }

  function applyToLoadout(s) {
    if (s.primary)   setSlot('primary',   s.primary.item)
    if (s.secondary) setSlot('secondary', s.secondary.item)
    if (s.throwable) setSlot('throwable', s.throwable.item)
    if (s.armor)     setSlot('armor',     s.armor.item)
    if (s.booster)   setSlot('booster',   s.booster.item)
    s.stratagems.forEach((st, i) => { if (st) setStratagemSlot(i, st.item) })
    onClose()
  }

  // Count active context items for status line
  const activeCtxCount = factions.length + enemies.length + selectedConditions.length + (mission ? 1 : 0) + (playstyle ? 1 : 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[900px] max-h-[92vh] flex flex-col bg-hd-surface border border-hd-border rounded-lg shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hd-border bg-hd-surface-2 shrink-0">
          <div>
            <div className="font-display text-lg font-bold text-hd-yellow tracking-wide">
              ◈ REQUISITION ADVISOR
            </div>
            <div className="text-[10px] font-body italic text-hd-text-dim">
              "Ministry-approved loadout recommendations. Compliance is encouraged."
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeCtxCount > 0 && (
              <div className="text-[9px] font-mono text-green-400 border border-green-800 bg-green-900/20 px-2 py-0.5 rounded">
                {activeCtxCount} context factor{activeCtxCount !== 1 ? 's' : ''} active
              </div>
            )}
            <button onClick={onClose} className="text-hd-muted hover:text-hd-text transition-colors text-xl px-2">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hd-border shrink-0 bg-hd-surface-2">
          <button
            onClick={() => setTab('suggest')}
            className={`px-5 py-2.5 text-xs font-mono border-b-2 transition-colors ${
              tab === 'suggest'
                ? 'border-hd-yellow text-hd-yellow'
                : 'border-transparent text-hd-text-dim hover:text-hd-text'
            }`}
          >
            ◈ SUGGEST ALL
          </button>
          <button
            onClick={() => setTab('build')}
            className={`px-5 py-2.5 text-xs font-mono border-b-2 transition-colors ${
              tab === 'build'
                ? 'border-hd-yellow text-hd-yellow'
                : 'border-transparent text-hd-text-dim hover:text-hd-text'
            }`}
          >
            ◉ BUILD AROUND
            {buildAroundItem && <span className="ml-1.5 text-[9px] text-hd-yellow/60">· {buildAroundItem.item?.name?.split(' ').slice(-1)[0]}</span>}
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left panel */}
          <div className="w-72 shrink-0 border-r border-hd-border flex flex-col overflow-y-auto">
            <div className="p-3 space-y-4">

              {/* BUILD AROUND anchor selector */}
              {tab === 'build' && (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">
                    Anchor Item
                  </div>
                  <AnchorSearch onSelect={(item, slot) => setBuildAroundItem(item, slot)} />
                  {buildAroundItem ? (
                    <div
                      className="p-2 border rounded bg-hd-surface-2 space-y-1"
                      style={buildAroundItem.item?.warbond && WARBONDS[buildAroundItem.item.warbond]
                        ? { borderColor: WARBONDS[buildAroundItem.item.warbond].color + '60', borderLeftWidth: '3px', borderLeftColor: WARBONDS[buildAroundItem.item.warbond].color }
                        : { borderColor: '#f5c518' }
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-hd-yellow/60 uppercase">◉ Anchor · {buildAroundItem.slotType}</span>
                        <button onClick={clearBuildAround} className="text-[9px] text-hd-muted hover:text-red-400">✕</button>
                      </div>
                      <div className="text-sm font-display font-semibold text-hd-yellow">{buildAroundItem.item?.name}</div>
                      {buildAroundItem.item?.warbond && <WarbondDot warbond={buildAroundItem.item.warbond} />}
                    </div>
                  ) : (
                    <div className="text-[9px] font-mono text-hd-muted italic">
                      Search or pick from current loadout:
                    </div>
                  )}
                  {/* Quick pick from current slots */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: 'primary', item: slots.primary },
                      { key: 'secondary', item: slots.secondary },
                      { key: 'throwable', item: slots.throwable },
                      { key: 'armor', item: slots.armor },
                      ...slots.stratagems.map((s, i) => ({ key: 'stratagem', item: s, idx: i })),
                    ].filter(s => s.item).map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setBuildAroundItem(s.item, s.key)}
                        className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors truncate max-w-[100px] ${
                          buildAroundItem?.item?.id === s.item.id
                            ? 'border-hd-yellow text-hd-yellow bg-hd-yellow/10'
                            : 'border-hd-border text-hd-muted hover:border-hd-border-2'
                        }`}
                      >
                        {s.item.name}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-hd-border pt-2" />
                </div>
              )}

              {/* Threat assessment */}
              <ThreatSelector />

              {/* Mission */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">
                  Mission Type
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {missionsData.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMission(prev => prev?.id === m.id ? null : m)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded border text-left transition-colors ${
                        mission?.id === m.id
                          ? 'border-hd-yellow bg-hd-yellow/10 text-hd-yellow'
                          : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
                      }`}
                    >
                      <span className="text-sm shrink-0">{m.icon}</span>
                      <span className="text-[10px] font-body leading-tight truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
                {mission && (
                  <div className="mt-1.5 text-[9px] font-body italic text-hd-text-dim px-1">{mission.notes}</div>
                )}
              </div>

              {/* Playstyle selector */}
              <div>
                <button
                  onClick={() => setShowPlaystyle(v => !v)}
                  className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 hover:text-hd-yellow/70 transition-colors mb-1"
                >
                  <span>Playstyle {playstyle ? `· ${playstyle.name}` : ''}</span>
                  <span>{showPlaystyle ? '▲' : '▼'}</span>
                </button>
                {showPlaystyle && (
                  <div className="space-y-0.5 max-h-40 overflow-y-auto">
                    <button
                      onClick={() => setSelectedPlaystyle(null)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border text-left transition-colors text-xs ${
                        !playstyle ? 'border-hd-yellow bg-hd-yellow/10 text-hd-yellow' : 'border-transparent text-hd-muted hover:bg-hd-surface-2'
                      }`}
                    >
                      None
                    </button>
                    {playstylesData.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setSelectedPlaystyle(p.id); setShowPlaystyle(false) }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border text-left transition-colors ${
                          selectedPlaystyle === p.id
                            ? 'border-hd-yellow bg-hd-yellow/10 text-hd-yellow'
                            : 'border-transparent text-hd-text-dim hover:bg-hd-surface-2'
                        }`}
                      >
                        <span className="text-base shrink-0">{p.icon}</span>
                        <div>
                          <div className="text-xs font-display font-semibold leading-tight">{p.name}</div>
                          <div className="text-[9px] font-mono text-hd-muted leading-tight">{p.subtitle}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Synergy modes */}
              <SynergyModes />

              {/* Stratagem limits — always visible, has own AUTO/MANUAL toggle */}
              <StratagemLimits />

              {/* Owned warbonds (collapsible) */}
              <div>
                <button
                  onClick={() => setShowWarbonds(v => !v)}
                  className="flex items-center justify-between w-full text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 hover:text-hd-yellow/70 transition-colors mb-1"
                >
                  <span>Owned Warbonds</span>
                  <span>{showWarbonds ? '▲' : '▼'}</span>
                </button>
                {showWarbonds && <OwnedWarbonds />}
              </div>

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={generating}
                className={`w-full py-2.5 font-mono text-sm border rounded transition-all ${
                  generating
                    ? 'border-hd-border text-hd-muted cursor-wait animate-pulse'
                    : 'border-hd-yellow text-hd-bg bg-hd-yellow hover:bg-hd-yellow-dim'
                }`}
              >
                {generating ? '◎ ANALYZING INTEL...' : tab === 'build' ? '◉ BUILD LOADOUT' : '◈ GENERATE LOADOUT'}
              </button>
            </div>
          </div>

          {/* Right: suggestions */}
          <div className="flex-1 overflow-y-auto p-3">
            {!suggestion ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-16">
                <div className="text-5xl mb-4">⚔</div>
                <div className="font-display text-hd-yellow font-semibold text-lg mb-2">
                  {tab === 'build' ? 'Select an anchor item' : 'Awaiting Intel'}
                </div>
                <div className="text-xs text-hd-text-dim font-body max-w-xs leading-relaxed">
                  {tab === 'build'
                    ? 'Pick a weapon, armor, or stratagem to build around, then generate.'
                    : 'Configure threat assessment, mission, and synergy modes, then generate your loadout.'}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 animate-fadeIn">
                {/* Context banner */}
                <div className="flex flex-wrap gap-2 px-3 py-2 bg-hd-surface-2 border border-hd-border rounded text-[9px] font-mono">
                  {factions.length > 0 && <span className="text-hd-text-dim">vs <span className="text-hd-text">{factions.map(f => f.name).join(', ')}</span></span>}
                  {mission && <span className="text-hd-text-dim">· <span className="text-hd-yellow">{mission.name}</span></span>}
                  {playstyle && <span className="text-hd-text-dim">· {playstyle.icon} <span className="text-hd-text">{playstyle.name}</span></span>}
                  {selectedConditions.length > 0 && <span className="text-hd-text-dim">· {selectedConditions.length} condition{selectedConditions.length !== 1 ? 's' : ''}</span>}
                  {buildAroundItem && tab === 'build' && <span className="text-hd-yellow">◉ built around {buildAroundItem.item?.name}</span>}
                </div>

                <ApplyButton suggestion={suggestion} onApply={applyToLoadout} />

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-1">
                  ◆ Standard Issue
                </div>
                <SuggestedItem
                  label="Primary"
                  scored={suggestion.primary}
                  alternatives={suggestion.alternatives?.primary ?? []}
                  onEquip={item => equipItem(item, 'primary')}
                />
                <SuggestedItem
                  label="Sidearm"
                  scored={suggestion.secondary}
                  alternatives={suggestion.alternatives?.secondary ?? []}
                  onEquip={item => equipItem(item, 'secondary')}
                />
                <SuggestedItem
                  label="Throwable"
                  scored={suggestion.throwable}
                  alternatives={suggestion.alternatives?.throwable ?? []}
                  onEquip={item => equipItem(item, 'throwable')}
                />

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-1">
                  ◆ Field Gear
                </div>
                <SuggestedItem
                  label="Armor"
                  scored={suggestion.armor}
                  alternatives={suggestion.alternatives?.armor ?? []}
                  onEquip={item => equipItem(item, 'armor')}
                />

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-1">
                  ◆ Authorized Stratagems
                </div>
                {suggestion.stratagems.map((s, i) => (
                  <SuggestedItem
                    key={i}
                    label={`Stratagem ${i + 1}`}
                    scored={s}
                    alternatives={i === 0 ? (suggestion.alternatives?.stratagems ?? []) : []}
                    onEquip={item => setStratagemSlot(i, item)}
                  />
                ))}

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-1">
                  ◆ Mission Support
                </div>
                <SuggestedItem
                  label="Booster"
                  scored={suggestion.booster}
                  alternatives={suggestion.alternatives?.booster ?? []}
                  onEquip={item => equipItem(item, 'booster')}
                />

                <ApplyButton suggestion={suggestion} onApply={applyToLoadout} label="◈ APPLY FULL LOADOUT" />

                <div className="text-[9px] font-mono text-hd-muted text-center pb-2">
                  CLASSIFICATION: DEMOCRATIC USE ONLY — MINISTRY OF TRUTH
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
