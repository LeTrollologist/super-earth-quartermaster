import { useState, useMemo } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { suggestLoadout, DIFFICULTY_LABELS } from '../../utils/suggestions'
import { suggestSquadLoadout, ROLE_COLORS } from '../../utils/squadSuggestions'
import { SquadSynergyScore } from '../squad/SquadSynergyScore'
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

// ── Sub-components ──────────────────────────────────────────────────────────

function WarbondDot({ warbond }) {
  if (!warbond) return null
  const wb = WARBONDS[warbond]
  if (!wb) return null
  return (
    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono" style={{ color: wb.color + 'cc' }}>
      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: wb.color }} />
      {wb.label}
    </span>
  )
}

function ScoreBadge({ score, locked, dimensions, expanded, onToggle }) {
  if (locked) return (
    <span className="text-[9px] font-mono text-hd-yellow/70 border border-hd-yellow/30 px-1 rounded">◉ ANCHOR</span>
  )
  const color = score >= 70 ? 'text-green-400 border-green-600' : score >= 45 ? 'text-yellow-400 border-yellow-600' : 'text-red-400 border-red-600'
  return (
    <div className="inline-block">
      <button
        onClick={onToggle}
        className={`text-[9px] font-mono border px-1 rounded cursor-pointer hover:opacity-80 ${color}`}
        title="Click to expand score breakdown"
      >
        {score}/100 {expanded ? '▾' : '▸'}
      </button>
      {expanded && dimensions && (
        <div className="mt-1 space-y-0.5">
          {Object.entries(dimensions).filter(([,v]) => v !== 0).map(([key, val]) => {
            const pct = Math.max(0, Math.min(100, val + 50))
            const barColor = pct >= 60 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            return (
              <div key={key} className="flex items-center gap-1">
                <span className="text-[8px] font-mono text-hd-muted w-12 text-right capitalize">{key}</span>
                <div className="flex-1 h-1 bg-hd-faded rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[8px] font-mono text-hd-text-dim w-6">{val > 0 ? `+${val}` : val}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SuggestedItem({ label, scored, alternatives = [], onEquip }) {
  const [expanded, setExpanded] = useState(false)
  if (!scored) return null
  const { item, score, rationale, locked, dimensions } = scored
  const wb = item.warbond ? WARBONDS[item.warbond] : null

  return (
    <div className="border border-hd-border rounded overflow-hidden" style={wb ? { borderLeftColor: wb.color, borderLeftWidth: '3px' } : {}}>
      <div className="flex items-start gap-2.5 p-2.5 bg-hd-surface-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 shrink-0">{label}</div>
            <ScoreBadge score={score} locked={locked} dimensions={dimensions} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
            {item.warbond && <WarbondDot warbond={item.warbond} />}
          </div>
          <div className="font-display font-semibold text-sm text-hd-yellow leading-tight mb-1.5">{item.name}</div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.category && <CategoryBadge category={item.category} />}
            {item.apTier && <APBadge tier={item.apTier} />}
            {item.damageType && item.damageType !== 'None' && <DamageTypeBadge type={item.damageType} />}
            {item.type && !item.category && <CategoryBadge category={item.type} />}
          </div>
          <div className="flex flex-wrap gap-3 text-[10px] font-mono text-hd-text-dim mb-1.5">
            {item.damage > 0 && <span>DMG <span className="text-hd-text">{item.damage}</span></span>}
            {item.dps > 0 && <span>DPS <span className="text-hd-text">{item.dps}</span></span>}
            {item.fireRate > 0 && <span>RPM <span className="text-hd-text">{item.fireRate}</span></span>}
            {item.armorRating && <span>ARM <span className="text-hd-text">{item.armorRating}</span></span>}
            {item.speed && <span>SPD <span className="text-hd-text">{item.speed}</span></span>}
            {item.cooldown && <span>CD <span className="text-hd-text">{item.cooldown}s</span></span>}
          </div>
          {item.passive && <div className="text-[10px] font-mono text-hd-yellow/80 mb-1.5">⚡ {item.passive}</div>}
          {item.sequence && <div className="mb-1.5"><ArrowSequence sequence={item.sequence} /></div>}
          {item.effect && !item.sequence && <div className="text-[10px] font-mono text-teal-400 mb-1.5">{item.effect}</div>}
          <div className="space-y-0.5 mb-2">
            {(rationale ?? []).map((r, i) => (
              <div key={i} className="flex items-start gap-1 text-[10px] font-body text-green-400">
                <span className="shrink-0 mt-px">✓</span><span>{r}</span>
              </div>
            ))}
          </div>
          {alternatives.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              <span className="text-[9px] font-mono text-hd-muted self-center">alt:</span>
              {alternatives.map(alt => (
                <button key={alt.item.id} onClick={() => onEquip?.(alt.item)}
                  className="px-1.5 py-0.5 text-[9px] font-mono border border-hd-border rounded text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow transition-colors"
                  title={`Score: ${alt.score}/100`}
                >{alt.item.name}</button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onEquip?.(item)}
          className="shrink-0 self-start text-[9px] font-mono border border-hd-yellow/40 text-hd-yellow/70 hover:border-hd-yellow hover:text-hd-yellow px-2 py-1 rounded transition-colors"
        >EQUIP</button>
      </div>
    </div>
  )
}

function ApplyButton({ suggestion, onApply, label = '◈ APPLY FULL LOADOUT' }) {
  const [applied, setApplied] = useState(false)
  function handle() { onApply(suggestion); setApplied(true); setTimeout(() => setApplied(false), 2500) }
  return (
    <button onClick={handle} className={`w-full py-2.5 font-mono text-sm border-2 rounded transition-all ${
      applied ? 'border-green-600 bg-green-900/30 text-green-400' : 'border-hd-yellow text-hd-bg bg-hd-yellow hover:bg-hd-yellow-dim'
    }`}>
      {applied ? '✦ REQUISITION SUBMITTED ✦' : label}
    </button>
  )
}

// ── Sidebar components ────────────────────────────────────────────────────────

function ThreatSelector() {
  const selectedFactions = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const toggleFaction = useLoadoutStore(s => s.toggleFaction)
  const toggleEnemy = useLoadoutStore(s => s.toggleEnemy)
  const toggleCondition = useLoadoutStore(s => s.toggleCondition)
  const [showEnemies, setShowEnemies] = useState(false)
  const [showConds, setShowConds] = useState(false)

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">Threat Assessment</div>
      <div className="flex gap-1.5 flex-wrap">
        {enemiesData.factions.map(f => (
          <button key={f.id} onClick={() => toggleFaction(f.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[10px] font-mono transition-colors ${
              selectedFactions.includes(f.id) ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow' : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
            }`}>{f.icon} {f.name}</button>
        ))}
      </div>
      {selectedFactions.length > 0 && (
        <div>
          <button onClick={() => setShowEnemies(v => !v)} className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors">
            {showEnemies ? '▼' : '▶'} SPECIFIC ENEMIES{selectedEnemies.length > 0 && ` (${selectedEnemies.length})`}
          </button>
          {showEnemies && (
            <div className="mt-1 flex flex-wrap gap-1">
              {enemiesData.enemies.filter(e => selectedFactions.includes(e.faction)).map(e => (
                <button key={e.id} onClick={() => toggleEnemy(e.id)}
                  className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${
                    selectedEnemies.includes(e.id) ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow' : 'border-hd-border text-hd-muted hover:border-hd-border-2'
                  }`}>{e.name} <span className="opacity-50">AP{e.armorTier}</span></button>
              ))}
            </div>
          )}
        </div>
      )}
      <div>
        <button onClick={() => setShowConds(v => !v)} className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors">
          {showConds ? '▼' : '▶'} PLANET CONDITIONS{selectedConditions.length > 0 && ` (${selectedConditions.length})`}
        </button>
        {showConds && (
          <div className="mt-1 flex flex-wrap gap-1">
            {planetsData.conditions.map(c => (
              <button key={c.id} onClick={() => toggleCondition(c.id)}
                className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${
                  selectedConditions.includes(c.id) ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow' : 'border-hd-border text-hd-muted hover:border-hd-border-2'
                }`}>{c.name}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DifficultySelector() {
  const difficulty = useLoadoutStore(s => s.difficulty)
  const setDifficulty = useLoadoutStore(s => s.setDifficulty)
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">Difficulty</div>
      <div className="flex flex-wrap gap-1">
        {DIFFICULTY_LABELS.map((label, i) => {
          const level = i + 1
          const active = difficulty === level
          const color = level >= 7 ? 'border-red-600 bg-red-900/20 text-red-400' : level >= 4 ? 'border-yellow-600 bg-yellow-900/20 text-yellow-400' : 'border-green-600 bg-green-900/20 text-green-400'
          return (
            <button key={level} onClick={() => setDifficulty(level)}
              className={`px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${active ? color : 'border-hd-border text-hd-muted hover:border-hd-border-2'}`}
            >{level}</button>
          )
        })}
      </div>
      <div className="text-[9px] font-mono text-hd-text-dim mt-1">{DIFFICULTY_LABELS[(difficulty ?? 5) - 1] ?? 'Hard'}</div>
    </div>
  )
}

function MissionSelector({ mission, setMission }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">Mission Type</div>
      <div className="grid grid-cols-2 gap-1">
        {(missionsData ?? []).map(m => (
          <button key={m.id} onClick={() => setMission(mission?.id === m.id ? null : m)}
            className={`px-2 py-1 text-[9px] font-mono border rounded text-left transition-colors truncate ${
              mission?.id === m.id ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow' : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
            }`}>{m.name}</button>
        ))}
      </div>
    </div>
  )
}

function PlaystyleSelector() {
  const selectedPlaystyle = useLoadoutStore(s => s.selectedPlaystyle)
  const setSelectedPlaystyle = useLoadoutStore(s => s.setSelectedPlaystyle)
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">Playstyle</div>
      <div className="max-h-32 overflow-y-auto space-y-0.5">
        {playstylesData.map(p => (
          <button key={p.id} onClick={() => setSelectedPlaystyle(selectedPlaystyle === p.id ? null : p.id)}
            className={`w-full flex items-center gap-2 px-2 py-1 text-left rounded border text-[9px] font-mono transition-colors ${
              selectedPlaystyle === p.id ? 'bg-hd-yellow/10 border-hd-yellow/60 text-hd-yellow' : 'border-transparent text-hd-text-dim hover:bg-hd-surface-2'
            }`}>
            <span>{p.icon ?? '◆'}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate">{p.name}</div>
              {p.subtitle && <div className="text-[8px] text-hd-muted truncate">{p.subtitle}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function SynergyModes() {
  const synergyModes = useLoadoutStore(s => s.synergyModes)
  const toggleSynergyMode = useLoadoutStore(s => s.toggleSynergyMode)
  const modes = [
    { key: 'faction', label: 'Faction', desc: 'vs enemies' },
    { key: 'planet', label: 'Planet', desc: 'conditions' },
    { key: 'mission', label: 'Mission', desc: 'mission type' },
    { key: 'playstyle', label: 'Style', desc: 'archetype' },
    { key: 'loadout', label: 'Loadout', desc: 'complement' },
  ]
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">Synergy Modes</div>
      <div className="space-y-1">
        {modes.map(m => (
          <div key={m.key} className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-hd-text-dim">{m.label}</span>
              <span className="text-[9px] font-mono text-hd-muted ml-1">{m.desc}</span>
            </div>
            <button onClick={() => toggleSynergyMode(m.key)}
              className={`text-[9px] font-mono border px-1.5 py-0.5 rounded transition-colors ${
                synergyModes[m.key]
                  ? 'border-green-600 bg-green-900/20 text-green-400'
                  : 'border-hd-border text-hd-muted/60 bg-hd-faded/30 opacity-60'
              }`}>
              {synergyModes[m.key] ? 'ON' : 'DIM'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function StratagemLimits() {
  const stratagemLimits = useLoadoutStore(s => s.stratagemLimits)
  const stratagemLimitsEnabled = useLoadoutStore(s => s.stratagemLimitsEnabled)
  const setStratagemLimit = useLoadoutStore(s => s.setStratagemLimit)
  const toggleStratagemLimits = useLoadoutStore(s => s.toggleStratagemLimits)
  const categories = ['Orbital', 'Eagle', 'Support Weapon', 'Backpack', 'Sentry', 'Emplacement', 'Vehicle']
  const totalAllocated = categories.reduce((sum, cat) => sum + (stratagemLimits[cat] ?? 0), 0)
  const remaining = 4 - totalAllocated

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">Stratagem Allocation</div>
        <button onClick={toggleStratagemLimits}
          className={`text-[9px] font-mono border px-1.5 py-0.5 rounded transition-colors ${
            stratagemLimitsEnabled ? 'border-hd-yellow/60 bg-hd-yellow/10 text-hd-yellow' : 'border-hd-border text-hd-muted hover:border-hd-border-2'
          }`}>{stratagemLimitsEnabled ? 'MANUAL' : 'AUTO'}</button>
      </div>
      {!stratagemLimitsEnabled ? (
        <div className="text-[9px] font-mono text-hd-muted italic">Best 4 by synergy score</div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-0.5">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-6 h-1.5 rounded-sm transition-colors ${i < totalAllocated ? 'bg-hd-yellow' : 'bg-hd-faded'}`} />
              ))}
            </div>
            <span className={`text-[9px] font-mono ${totalAllocated >= 4 ? 'text-hd-yellow' : 'text-hd-text-dim'}`}>{totalAllocated}/4</span>
          </div>
          <div className="space-y-1">
            {categories.map(cat => {
              const val = stratagemLimits[cat] ?? 0
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className="text-[9px] font-mono text-hd-text-dim w-24 shrink-0 truncate">{cat}</div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setStratagemLimit(cat, Math.max(0, val - 1))} disabled={val === 0}
                      className="w-5 h-5 text-[10px] font-mono border border-hd-border rounded transition-colors disabled:opacity-25 hover:enabled:border-hd-border-2 text-hd-text-dim">−</button>
                    <span className={`text-[10px] font-mono w-4 text-center ${val > 0 ? 'text-hd-yellow' : 'text-hd-muted'}`}>{val}</span>
                    <button onClick={() => setStratagemLimit(cat, val + 1)} disabled={remaining <= 0}
                      className="w-5 h-5 text-[10px] font-mono border border-hd-border rounded transition-colors disabled:opacity-25 hover:enabled:border-hd-border-2 text-hd-text-dim">+</button>
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

function OwnedWarbonds() {
  const ownedWarbonds = useLoadoutStore(s => s.ownedWarbonds)
  const toggleOwnedWarbond = useLoadoutStore(s => s.toggleOwnedWarbond)
  const setAllWarbondsOwned = useLoadoutStore(s => s.setAllWarbondsOwned)
  const warbondFilterMode = useLoadoutStore(s => s.warbondFilterMode)
  const setWarbondFilterMode = useLoadoutStore(s => s.setWarbondFilterMode)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">Warbond Filter</div>
        <button onClick={setAllWarbondsOwned} className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors">All</button>
      </div>
      {/* 3-way mode */}
      <div className="flex gap-1 mb-2">
        {['all', 'prefer', 'owned'].map(mode => (
          <button key={mode} onClick={() => setWarbondFilterMode(mode)}
            className={`flex-1 py-0.5 text-[9px] font-mono border rounded transition-colors ${
              warbondFilterMode === mode ? 'border-hd-yellow/60 bg-hd-yellow/10 text-hd-yellow' : 'border-hd-border text-hd-muted'
            }`}>{mode === 'prefer' ? 'PREFER' : mode.toUpperCase()}</button>
        ))}
      </div>
      {warbondFilterMode !== 'all' && (
        <div className="flex flex-wrap gap-1">
          {WARBOND_ORDER.map(wb => {
            const info = WARBONDS[wb]
            const owned = ownedWarbonds.has(wb)
            return (
              <button key={wb} onClick={() => toggleOwnedWarbond(wb)}
                style={owned ? { backgroundColor: info.color + '25', borderColor: info.color + '80', color: info.color } : {}}
                className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono border rounded transition-colors ${owned ? '' : 'border-hd-border text-hd-muted opacity-40'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                {info.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AnchorSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_ITEMS.filter(i => i.name.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  return (
    <div className="relative">
      <input type="text" value={query} onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search any item to anchor around..."
        className="w-full bg-hd-surface-2 border border-hd-border rounded px-3 py-1.5 text-xs font-mono text-hd-text placeholder-hd-muted focus:outline-none focus:border-hd-yellow/50 transition-colors"
      />
      {focused && results.length > 0 && (
        <div className="absolute z-10 top-full left-0 right-0 mt-0.5 bg-hd-surface border border-hd-border rounded shadow-xl max-h-48 overflow-y-auto">
          {results.map(item => (
            <button key={item.id} onMouseDown={() => { onSelect(item, item._slot); setQuery('') }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-hd-surface-2 transition-colors">
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

// ── Squad Suggest Results ───────────────────────────────────────────────────
function SquadSuggestResults({ squadResult, onApply }) {
  if (!squadResult) return null
  const { members, squadScore, coverageChecks } = squadResult

  return (
    <div className="space-y-3">
      <SquadSynergyScore squadScore={squadScore} coverageChecks={coverageChecks} />
      <div className="grid grid-cols-2 gap-2">
        {members.map((m, i) => {
          const roleColor = ROLE_COLORS[m.role] ?? '#6b7280'
          const loadout = m.loadout
          return (
            <div key={i} className="border border-hd-border rounded p-2 bg-hd-surface-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: roleColor }} />
                <span className="text-[10px] font-mono text-hd-text font-semibold">Diver {i + 1}</span>
                <span className="text-[8px] font-mono uppercase px-1 py-0.5 rounded border" style={{ color: roleColor, borderColor: roleColor + '66' }}>{m.role.replace(/-/g, ' ')}</span>
                <span className="text-[9px] font-mono text-hd-muted ml-auto">{m.memberScore}/100</span>
              </div>
              <div className="space-y-0.5 text-[9px] font-mono">
                {loadout.primary && <div className="text-hd-text-dim truncate">◆ {loadout.primary.item.name}</div>}
                {loadout.secondary && <div className="text-hd-text-dim truncate">◆ {loadout.secondary.item.name}</div>}
                {loadout.armor && <div className="text-hd-text-dim truncate">◇ {loadout.armor.item.name} <span className="text-hd-muted">({loadout.armor.item.passive})</span></div>}
                {(loadout.stratagems ?? []).filter(Boolean).map((s, j) => (
                  <div key={j} className="text-hd-text-dim truncate">◈ {s.item.name}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <ApplyButton
        suggestion={squadResult}
        onApply={() => onApply(squadResult)}
        label="◈ APPLY TO SQUAD"
      />
    </div>
  )
}

// ── Main panel ──────────────────────────────────────────────────────────────
export function SuggestPanel({ onClose }) {
  const selectedFactions = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const getActiveSlots = useLoadoutStore(s => s.getActiveSlots)
  const slots = getActiveSlots()
  const stratagemLimits = useLoadoutStore(s => s.stratagemLimits)
  const stratagemLimitsEnabled = useLoadoutStore(s => s.stratagemLimitsEnabled)
  const synergyModes = useLoadoutStore(s => s.synergyModes)
  const ownedWarbonds = useLoadoutStore(s => s.ownedWarbonds)
  const warbondFilterMode = useLoadoutStore(s => s.warbondFilterMode)
  const difficulty = useLoadoutStore(s => s.difficulty)
  const setBuildAroundItem = useLoadoutStore(s => s.setBuildAroundItem)
  const clearBuildAround = useLoadoutStore(s => s.clearBuildAround)
  const buildAroundItem = useLoadoutStore(s => s.buildAroundItem)
  const selectedPlaystyle = useLoadoutStore(s => s.selectedPlaystyle)
  const setSlot = useLoadoutStore(s => s.setSlot)
  const setStratagemSlot = useLoadoutStore(s => s.setStratagemSlot)
  const squadMode = useLoadoutStore(s => s.squadMode)
  const applySquadSuggestion = useLoadoutStore(s => s.applySquadSuggestion)

  const [tab, setTab] = useState('suggest')
  const [mission, setMission] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [squadResult, setSquadResult] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [allowDupeSW, setAllowDupeSW] = useState(false)

  const factions = enemiesData.factions.filter(f => selectedFactions.includes(f.id))
  const enemies = enemiesData.enemies.filter(e => selectedEnemies.includes(e.id))
  const playstyle = playstylesData.find(p => p.id === selectedPlaystyle) ?? null

  function generate() {
    setGenerating(true)
    setTimeout(() => {
      const result = suggestLoadout({
        weapons: weaponsData, armor: armorData, stratagems: stratagemData, boosters: boosterData,
        factions, enemies, conditions: selectedConditions, mission: mission?.id ?? null,
        playstyle, difficulty, stratagemLimits, stratagemLimitsEnabled,
        buildAround: buildAroundItem, currentSlots: slots, synergyModes, ownedWarbonds, warbondFilterMode,
      })
      setSuggestion(result)
      setGenerating(false)
    }, 200)
  }

  function generateSquad() {
    setGenerating(true)
    setTimeout(() => {
      const result = suggestSquadLoadout({
        weapons: weaponsData, armor: armorData, stratagems: stratagemData, boosters: boosterData,
        factions, enemies, conditions: selectedConditions, mission: mission?.id ?? null,
        difficulty, synergyModes, stratagemLimits, stratagemLimitsEnabled,
        ownedWarbonds, warbondFilterMode, allowDuplicateSupportWeapons: allowDupeSW,
      })
      setSquadResult(result)
      setGenerating(false)
    }, 400)
  }

  function equipItem(item, slotType) {
    if (slotType === 'stratagem') {
      const strats = slots.stratagems ?? [null,null,null,null]
      const emptyIdx = strats.findIndex(s => s === null)
      setStratagemSlot(emptyIdx >= 0 ? emptyIdx : 0, item)
    } else if (slotType) setSlot(slotType, item)
  }

  function applyToLoadout(s) {
    if (s.primary) setSlot('primary', s.primary.item)
    if (s.secondary) setSlot('secondary', s.secondary.item)
    if (s.throwable) setSlot('throwable', s.throwable.item)
    if (s.armor) setSlot('armor', s.armor.item)
    if (s.booster) setSlot('booster', s.booster.item)
    ;(s.stratagems ?? []).forEach((st, i) => { if (st) setStratagemSlot(i, st.item) })
    onClose()
  }

  function handleSquadApply(result) {
    applySquadSuggestion(result.members.map(m => m.loadout))
    onClose()
  }

  const activeCtxCount = factions.length + enemies.length + selectedConditions.length + (mission ? 1 : 0) + (playstyle ? 1 : 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[940px] max-h-[92vh] flex flex-col bg-hd-surface border border-hd-border rounded-lg shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-hd-border bg-hd-surface-2 shrink-0">
          <div>
            <div className="font-display text-lg font-bold text-hd-yellow tracking-wide">◈ REQUISITION ADVISOR</div>
            <div className="text-[10px] font-body italic text-hd-text-dim">"Ministry-approved loadout recommendations."</div>
          </div>
          <div className="flex items-center gap-3">
            {activeCtxCount > 0 && (
              <div className="text-[9px] font-mono text-green-400 border border-green-800 bg-green-900/20 px-2 py-0.5 rounded">
                {activeCtxCount} factor{activeCtxCount !== 1 ? 's' : ''}
              </div>
            )}
            <button onClick={onClose} className="text-hd-muted hover:text-hd-text transition-colors text-xl px-2">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hd-border shrink-0 bg-hd-surface-2">
          {[
            { id: 'suggest', label: '◈ SUGGEST ALL' },
            { id: 'build', label: '◉ BUILD AROUND' },
            ...(squadMode ? [{ id: 'squad', label: '◈ SQUAD SUGGEST' }] : []),
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-xs font-mono border-b-2 transition-colors ${
                tab === t.id ? 'border-hd-yellow text-hd-yellow' : 'border-transparent text-hd-text-dim hover:text-hd-text'
              }`}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-[320px] shrink-0 border-r border-hd-border overflow-y-auto p-4 space-y-4">
            <ThreatSelector />
            <DifficultySelector />
            <MissionSelector mission={mission} setMission={setMission} />
            <PlaystyleSelector />
            <SynergyModes />
            <StratagemLimits />
            <OwnedWarbonds />

            {tab === 'build' && (
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50">Anchor Item</div>
                <AnchorSearch onSelect={(item, slot) => setBuildAroundItem(item, slot)} />
                {buildAroundItem && (
                  <div className="flex items-center gap-2 p-2 bg-hd-yellow/5 border border-hd-yellow/30 rounded">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-display text-hd-yellow truncate">{buildAroundItem.item.name}</div>
                      <div className="text-[9px] font-mono text-hd-text-dim">{buildAroundItem.slotType}</div>
                    </div>
                    <button onClick={clearBuildAround} className="text-hd-muted hover:text-red-400 text-xs">✕</button>
                  </div>
                )}
              </div>
            )}

            {tab === 'squad' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="allow-dupe" checked={allowDupeSW} onChange={e => setAllowDupeSW(e.target.checked)}
                    className="accent-hd-yellow" />
                  <label htmlFor="allow-dupe" className="text-[9px] font-mono text-hd-text-dim">Allow duplicate support weapons</label>
                </div>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={tab === 'squad' ? generateSquad : generate}
              disabled={generating}
              className={`w-full py-2.5 font-mono text-sm rounded border-2 transition-all ${
                generating
                  ? 'border-hd-yellow/30 text-hd-yellow/30 bg-transparent cursor-wait'
                  : 'border-hd-yellow text-hd-bg bg-hd-yellow hover:bg-hd-yellow-dim'
              }`}
            >
              {generating ? '◎ COMPUTING...' : tab === 'squad' ? '◈ GENERATE SQUAD' : '◈ GENERATE'}
            </button>
          </div>

          {/* Right: results */}
          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'squad' ? (
              squadResult ? (
                <SquadSuggestResults squadResult={squadResult} onApply={handleSquadApply} />
              ) : (
                <div className="flex items-center justify-center h-full text-hd-muted font-mono text-sm">
                  Configure squad context and hit Generate
                </div>
              )
            ) : suggestion ? (
              <div className="space-y-2">
                <SuggestedItem label="Primary" scored={suggestion.primary} alternatives={suggestion.alternatives?.primary ?? []}
                  onEquip={item => equipItem(item, 'primary')} />
                <SuggestedItem label="Secondary" scored={suggestion.secondary} alternatives={suggestion.alternatives?.secondary ?? []}
                  onEquip={item => equipItem(item, 'secondary')} />
                <SuggestedItem label="Throwable" scored={suggestion.throwable} alternatives={suggestion.alternatives?.throwable ?? []}
                  onEquip={item => equipItem(item, 'throwable')} />
                <SuggestedItem label="Armor" scored={suggestion.armor} alternatives={suggestion.alternatives?.armor ?? []}
                  onEquip={item => equipItem(item, 'armor')} />
                {(suggestion.stratagems ?? []).map((strat, i) => (
                  <SuggestedItem key={i} label={`Stratagem ${i + 1}`} scored={strat}
                    onEquip={item => { setStratagemSlot(i, item) }} />
                ))}
                <SuggestedItem label="Booster" scored={suggestion.booster} alternatives={suggestion.alternatives?.booster ?? []}
                  onEquip={item => equipItem(item, 'booster')} />
                <ApplyButton suggestion={suggestion} onApply={applyToLoadout} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-hd-muted font-mono text-sm">
                Configure context and hit Generate
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
