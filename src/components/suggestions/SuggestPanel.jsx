import { useState } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { suggestLoadout } from '../../utils/suggestions'
import { APBadge } from '../ui/APBadge'
import { CategoryBadge } from '../ui/CategoryBadge'
import { DamageTypeBadge } from '../ui/DamageTypeBadge'
import { ArrowSequence } from '../ui/ArrowSequence'
import weaponsData    from '../../data/weapons.json'
import armorData      from '../../data/armor.json'
import stratagemData  from '../../data/stratagems.json'
import boosterData    from '../../data/boosters.json'
import passivesData   from '../../data/passives.json'
import enemiesData    from '../../data/enemies.json'
import planetsData    from '../../data/planets.json'
import missionsData   from '../../data/missions.json'

// ── Suggested item row ───────────────────────────────────────────────────────

function SuggestedItem({ label, scored, alternatives = [] }) {
  const [showAlt, setShowAlt] = useState(false)
  if (!scored) return null
  const { item, score, rationale } = scored

  return (
    <div className="border border-hd-border rounded overflow-hidden">
      {/* Main pick */}
      <div className="flex items-start gap-3 p-3 bg-hd-surface-2">
        <div className="shrink-0">
          <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-1">{label}</div>
          <div
            className="w-10 h-10 rounded border border-hd-border bg-hd-faded flex items-center justify-center text-lg"
            title={`Score: ${score}/100`}
          >
            {item.category === 'Grenade' ? '💣' :
             item.sequence   ? '📡' :
             item.armorRating !== undefined ? '🛡' :
             item.effect && !item.sequence ? '💊' : '🔫'}
          </div>
          <div className="text-[9px] font-mono text-center mt-0.5" style={{
            color: score >= 75 ? '#27ae60' : score >= 50 ? '#f5c518' : '#c0392b'
          }}>
            {score}/100
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-sm text-hd-yellow leading-tight mb-1.5">{item.name}</div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {item.category    && <CategoryBadge category={item.category} />}
            {item.apTier      && <APBadge tier={item.apTier} />}
            {item.damageType  && item.damageType !== 'None' && <DamageTypeBadge type={item.damageType} />}
            {item.type && !item.category && <CategoryBadge category={item.type} />}
            {item.sequence    && <ArrowSequence sequence={item.sequence} />}
          </div>

          {/* Quick stats */}
          {(item.damage > 0 || item.armorRating) && (
            <div className="flex gap-3 text-[10px] font-mono text-hd-text-dim mb-2">
              {item.damage > 0 && <span>DMG <span className="text-hd-text">{item.damage}</span></span>}
              {item.dps > 0    && <span>DPS <span className="text-hd-text">{item.dps}</span></span>}
              {item.armorRating && <span>ARM <span className="text-hd-text">{item.armorRating}</span></span>}
              {item.speed       && <span>SPD <span className="text-hd-text">{item.speed}</span></span>}
              {item.cooldown    && <span>CD <span className="text-hd-text">{item.cooldown}s</span></span>}
            </div>
          )}

          {/* Passive */}
          {item.passive && (
            <div className="text-[10px] font-mono text-hd-yellow/80 mb-2">⚡ {item.passive}</div>
          )}

          {/* Rationale */}
          <div className="space-y-0.5">
            {rationale.map((r, i) => (
              <div key={i} className="flex items-start gap-1 text-[10px] font-body text-green-400">
                <span className="shrink-0 mt-px">✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="border-t border-hd-border">
          <button
            onClick={() => setShowAlt(v => !v)}
            className="w-full px-3 py-1.5 text-[10px] font-mono text-hd-text-dim hover:text-hd-yellow transition-colors flex items-center gap-1"
          >
            <span>{showAlt ? '▼' : '▶'}</span>
            <span>Alternatives ({alternatives.length})</span>
          </button>
          {showAlt && (
            <div className="px-3 pb-2 space-y-1">
              {alternatives.map(alt => (
                <div key={alt.id} className="flex items-center gap-2 text-[10px] font-mono text-hd-text-dim">
                  <span className="text-hd-muted">·</span>
                  <span className="text-hd-text">{alt.name}</span>
                  {alt.apTier && <APBadge tier={alt.apTier} className="scale-90" />}
                  {alt.passive && <span className="text-hd-yellow/60">{alt.passive}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Mission type selector ────────────────────────────────────────────────────

function MissionSelector({ selected, onSelect }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">
        Mission Type
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {missionsData.map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(selected?.id === m.id ? null : m)}
            className={`flex items-center gap-2 px-2 py-2 rounded border text-left transition-colors ${
              selected?.id === m.id
                ? 'border-hd-yellow bg-hd-yellow/10 text-hd-yellow'
                : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
            }`}
          >
            <span className="text-base shrink-0">{m.icon}</span>
            <span className="text-xs font-body leading-tight">{m.name}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-2 text-[10px] font-body italic text-hd-text-dim leading-relaxed px-1">
          {selected.notes}
        </div>
      )}
    </div>
  )
}

// ── Apply to loadout button ──────────────────────────────────────────────────

function ApplyButton({ suggestion, onApply }) {
  const [applied, setApplied] = useState(false)
  function handle() {
    onApply(suggestion)
    setApplied(true)
    setTimeout(() => setApplied(false), 2000)
  }
  return (
    <button
      onClick={handle}
      className={`w-full py-2.5 font-mono text-sm border-2 rounded transition-all ${
        applied
          ? 'border-green-600 bg-green-900/30 text-green-400'
          : 'border-hd-yellow text-hd-yellow bg-hd-yellow/10 hover:bg-hd-yellow/20'
      }`}
    >
      {applied ? '✦ REQUISITION SUBMITTED ✦' : '▶ APPLY TO LOADOUT'}
    </button>
  )
}

// ── Main panel ───────────────────────────────────────────────────────────────

export function SuggestPanel({ onClose }) {
  const selectedFactions   = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies    = useLoadoutStore(s => s.selectedEnemies)
  const selectedConditions = useLoadoutStore(s => s.selectedConditions)
  const setSlot            = useLoadoutStore(s => s.setSlot)
  const setStratagemSlot   = useLoadoutStore(s => s.setStratagemSlot)

  const [mission,    setMission]    = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [generating, setGenerating] = useState(false)

  const factions   = enemiesData.factions.filter(f => selectedFactions.includes(f.id))
  const enemies    = enemiesData.enemies.filter(e => selectedEnemies.includes(e.id))
  const conditions = planetsData.conditions.filter(c => selectedConditions.includes(c.id))

  function generate() {
    setGenerating(true)
    // Small delay for UX feel
    setTimeout(() => {
      const result = suggestLoadout({
        weapons: weaponsData, armor: armorData,
        stratagems: stratagemData, boosters: boosterData,
        passivesData, factions, enemies, conditions, mission,
      })
      setSuggestion(result)
      setGenerating(false)
    }, 400)
  }

  function applyToLoadout(s) {
    if (s.primary)   setSlot('primary',   s.primary.item)
    if (s.secondary) setSlot('secondary', s.secondary.item)
    if (s.throwable) setSlot('throwable', s.throwable.item)
    if (s.armor)     setSlot('armor',     s.armor.item)
    if (s.booster)   setSlot('booster',   s.booster.item)
    s.stratagems.forEach((st, i) => setStratagemSlot(i, st.item))
    onClose()
  }

  const canGenerate = factions.length > 0 || enemies.length > 0 || conditions.length > 0 || mission

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[820px] max-h-[90vh] flex flex-col bg-hd-surface border border-hd-border rounded-lg shadow-2xl overflow-hidden animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-hd-border bg-hd-surface-2 shrink-0">
          <div>
            <div className="font-display text-lg font-bold text-hd-yellow tracking-wide">
              ◈ REQUISITION ADVISOR
            </div>
            <div className="text-[10px] font-body italic text-hd-text-dim">
              "Ministry-approved loadout recommendations. Compliance is encouraged."
            </div>
          </div>
          <button onClick={onClose} className="text-hd-muted hover:text-hd-text transition-colors text-xl px-2">✕</button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: Context selectors */}
          <div className="w-64 shrink-0 border-r border-hd-border flex flex-col overflow-y-auto">
            <div className="p-4 space-y-5">
              {/* Active context summary */}
              <div className="bg-hd-surface-2 border border-hd-border rounded p-3 space-y-1.5">
                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 mb-2">
                  Active Intel
                </div>
                {factions.length > 0 ? (
                  <div className="text-xs font-body text-hd-text">
                    <span className="text-hd-text-dim">Factions: </span>
                    {factions.map(f => f.name).join(', ')}
                  </div>
                ) : (
                  <div className="text-xs font-body text-hd-muted italic">No factions selected</div>
                )}
                {enemies.length > 0 && (
                  <div className="text-xs font-body text-hd-text">
                    <span className="text-hd-text-dim">Enemies: </span>
                    {enemies.map(e => e.name).join(', ')}
                  </div>
                )}
                {conditions.length > 0 && (
                  <div className="text-xs font-body text-hd-text">
                    <span className="text-hd-text-dim">Conditions: </span>
                    {conditions.map(c => c.name).join(', ')}
                  </div>
                )}
                {!canGenerate && (
                  <div className="text-[10px] font-mono text-hd-muted italic mt-1">
                    Set faction/enemies/conditions in the Threat Assessment panel first, or select a mission type below.
                  </div>
                )}
              </div>

              <MissionSelector selected={mission} onSelect={setMission} />

              {/* Generate button */}
              <button
                onClick={generate}
                disabled={generating}
                className={`w-full py-2.5 font-mono text-sm border rounded transition-all ${
                  generating
                    ? 'border-hd-border text-hd-muted cursor-wait animate-pulse_yellow'
                    : 'border-hd-yellow text-hd-bg bg-hd-yellow hover:bg-hd-yellow-dim'
                }`}
              >
                {generating ? '◎ ANALYZING INTEL...' : '◈ GENERATE LOADOUT'}
              </button>
            </div>
          </div>

          {/* Right: Suggestions */}
          <div className="flex-1 overflow-y-auto p-4">
            {!suggestion ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-16">
                <div className="text-5xl mb-4">⚔</div>
                <div className="font-display text-hd-yellow font-semibold text-lg mb-2">
                  Awaiting Intel
                </div>
                <div className="text-xs text-hd-text-dim font-body max-w-xs leading-relaxed">
                  Set your threat assessment in the left panel, select a mission type, then generate your Ministry-approved loadout recommendation.
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-fadeIn">
                {/* Mission header */}
                {mission && (
                  <div className="flex items-center gap-3 px-3 py-2 bg-hd-yellow/10 border border-hd-yellow/30 rounded">
                    <span className="text-xl">{mission.icon}</span>
                    <div>
                      <div className="font-display font-bold text-hd-yellow text-sm">{mission.name}</div>
                      <div className="text-[10px] font-body text-hd-text-dim">{mission.description}</div>
                    </div>
                  </div>
                )}

                {/* Apply button */}
                <ApplyButton suggestion={suggestion} onApply={applyToLoadout} />

                {/* Suggested items */}
                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-1">
                  ◆ Standard Issue
                </div>
                <SuggestedItem label="Primary"   scored={suggestion.primary}   alternatives={suggestion.alternatives.primary} />
                <SuggestedItem label="Sidearm"   scored={suggestion.secondary} alternatives={suggestion.alternatives.secondary} />
                <SuggestedItem label="Throwable" scored={suggestion.throwable} alternatives={suggestion.alternatives.throwable} />

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-2">
                  ◆ Field Gear
                </div>
                <SuggestedItem label="Armor" scored={suggestion.armor} alternatives={suggestion.alternatives.armor} />

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-2">
                  ◆ Authorized Stratagems
                </div>
                {suggestion.stratagems.map((s, i) => (
                  <SuggestedItem key={i} label={`Stratagem ${i + 1}`} scored={s}
                    alternatives={i === 0 ? suggestion.alternatives.stratagems : []} />
                ))}

                <div className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50 pt-2">
                  ◆ Mission Support
                </div>
                <SuggestedItem label="Booster" scored={suggestion.booster} alternatives={suggestion.alternatives.booster} />

                {/* Second apply at bottom */}
                <ApplyButton suggestion={suggestion} onApply={applyToLoadout} />

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
