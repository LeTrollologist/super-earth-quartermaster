import { CategoryBadge } from '../ui/CategoryBadge'
import { StatBar } from './StatBar'
import passivesData from '../../data/passives.json'

const TYPE_COLORS = {
  Light:  'text-sky-300',
  Medium: 'text-yellow-300',
  Heavy:  'text-orange-400',
}

export function ArmorStats({ armor, recommendedPassives = [] }) {
  if (!armor) return null

  const passive = passivesData[armor.passive]
  const isRecommended = recommendedPassives.includes(armor.passive)

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-display text-lg font-bold text-hd-yellow leading-tight">{armor.name}</h2>
          {isRecommended && (
            <span className="shrink-0 text-xs font-mono px-2 py-1 rounded border border-green-600 text-green-400 bg-green-900/30">
              ✓ Recommended
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CategoryBadge category={armor.type} />
          <span className={`text-sm font-body ${TYPE_COLORS[armor.type] ?? 'text-hd-text'}`}>
            {armor.type} Armor
          </span>
        </div>
        {armor.warbond && (
          <div className="text-xs text-hd-text-dim mt-1 font-body">
            <span className="text-hd-yellow/50">Warbond: </span>{armor.warbond}
          </div>
        )}
      </div>

      {/* Core Stats */}
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
          Core Stats
        </div>
        <div className="space-y-1.5">
          <StatBar label="Armor"      value={armor.armorRating} statKey="armorRating" displayValue={`${armor.armorRating}`} />
          <StatBar label="Speed"      value={armor.speed}       statKey="speed"       displayValue={`${armor.speed}`} />
          <StatBar label="Stamina"    value={armor.staminaRegen} statKey="staminaRegen" displayValue={`${armor.staminaRegen}`} />
        </div>
      </div>

      {/* Passive Ability */}
      {armor.passive && (
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
            Passive Ability
          </div>
          <div className={`rounded p-3 border ${
            isRecommended ? 'border-green-700 bg-green-900/20' : 'border-hd-border bg-hd-surface-2'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {passive?.icon && <span className="text-base">{passive.icon}</span>}
              <span className="font-display font-semibold text-hd-yellow text-sm">{armor.passive}</span>
            </div>
            {passive?.description && (
              <p className="text-xs text-hd-text-dim font-body leading-relaxed">{passive.description}</p>
            )}
            {passive?.factionBonus && (
              <div className="mt-1.5 text-xs font-mono text-green-400">
                ✓ Effective vs {passive.factionBonus.charAt(0).toUpperCase() + passive.factionBonus.slice(1)}
              </div>
            )}
            {passive?.environmentBonus && (
              <div className="mt-0.5 text-xs font-mono text-blue-400">
                ✓ Counters: {passive.environmentBonus.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
