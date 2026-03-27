import { useLoadoutStore } from '../../store/loadoutStore'
import { APBadge } from '../ui/APBadge'
import { CategoryBadge } from '../ui/CategoryBadge'
import { DamageTypeBadge } from '../ui/DamageTypeBadge'
import { ArrowSequence } from '../ui/ArrowSequence'
import { weaponEffectivenessScore, stratagemEffectivenessScore } from '../../utils/statCalc'
import enemiesData from '../../data/enemies.json'

function EffectivenessBar({ score }) {
  if (score === null || score === undefined) return null
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="mt-1.5">
      <div className="h-0.5 bg-hd-faded rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <div className={`text-[9px] font-mono mt-0.5 ${
        score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'
      }`}>
        {score}% vs selected
      </div>
    </div>
  )
}

export function ItemCard({ item, isSelected, onClick, onHover, onHoverEnd, compareMode, onCompare }) {
  const selectedFactions = useLoadoutStore(s => s.selectedFactions)
  const selectedEnemies  = useLoadoutStore(s => s.selectedEnemies)
  const factions = enemiesData.factions.filter(f => selectedFactions.includes(f.id))
  const enemies  = enemiesData.enemies.filter(e => selectedEnemies.includes(e.id))

  const isWeapon    = item.fireRate !== undefined || item.blastRadius !== undefined
  const isStratagem = item.sequence !== undefined
  const isArmor     = item.armorRating !== undefined
  const isBooster   = !isWeapon && !isStratagem && !isArmor

  const effectScore = isWeapon    ? weaponEffectivenessScore(item, enemies, factions)
    : isStratagem ? stratagemEffectivenessScore(item, enemies, factions)
    : null

  return (
    <div
      className={`relative p-2.5 rounded border cursor-pointer transition-all group ${
        isSelected
          ? 'border-hd-yellow bg-hd-yellow/10 shadow-hd-yellow'
          : 'border-hd-border bg-hd-surface hover:border-hd-border-2 hover:bg-hd-surface-2'
      }`}
      onClick={compareMode ? onCompare : onClick}
      onMouseEnter={() => onHover?.(item)}
      onMouseLeave={() => onHoverEnd?.()}
    >
      {/* Name */}
      <div className="text-xs font-display font-semibold text-hd-text leading-tight mb-1.5 pr-4">
        {item.name}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        {item.category   && <CategoryBadge category={item.category} />}
        {item.apTier     && <APBadge tier={item.apTier} />}
        {item.damageType && item.damageType !== 'None' && <DamageTypeBadge type={item.damageType} />}
        {item.type       && !item.category && <CategoryBadge category={item.type} />}
      </div>

      {/* Quick stats */}
      {isWeapon && item.damage !== undefined && (
        <div className="mt-1.5 flex gap-3 text-[10px] font-mono text-hd-text-dim">
          {item.damage    > 0 && <span>DMG <span className="text-hd-text">{item.damage}</span></span>}
          {item.dps       > 0 && <span>DPS <span className="text-hd-text">{item.dps}</span></span>}
          {item.fireRate  > 0 && <span>RPM <span className="text-hd-text">{item.fireRate}</span></span>}
        </div>
      )}
      {isArmor && (
        <div className="mt-1.5 flex gap-3 text-[10px] font-mono text-hd-text-dim">
          <span>ARM <span className="text-hd-text">{item.armorRating}</span></span>
          <span>SPD <span className="text-hd-text">{item.speed}</span></span>
          <span className="text-hd-yellow/70 truncate">{item.passive}</span>
        </div>
      )}
      {isStratagem && item.sequence && (
        <div className="mt-1.5">
          <ArrowSequence sequence={item.sequence} />
          <div className="text-[9px] font-mono text-hd-text-dim mt-0.5">
            {item.cooldown}s CD · {item.uses === -1 ? '∞' : `×${item.uses}`}
          </div>
        </div>
      )}
      {isBooster && (
        <div className="mt-1.5 text-[10px] font-mono text-teal-400">{item.effect}</div>
      )}

      {/* Effectiveness bar */}
      <EffectivenessBar score={effectScore} />

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 text-hd-yellow text-xs">✓</div>
      )}

      {/* Compare mode indicator */}
      {compareMode && (
        <div className="absolute top-1.5 right-1.5 text-hd-muted group-hover:text-hd-yellow text-xs">⊕</div>
      )}
    </div>
  )
}
