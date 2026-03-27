import { compareItems } from '../../utils/statCalc'
import { StatBar } from './StatBar'
import { APBadge } from '../ui/APBadge'
import { CategoryBadge } from '../ui/CategoryBadge'
import { DamageTypeBadge } from '../ui/DamageTypeBadge'
import { ArrowSequence } from '../ui/ArrowSequence'

const WEAPON_COMPARE_KEYS = [
  ['damage',          'Damage'],
  ['durableDamage',   'Durable DMG'],
  ['dps',             'DPS'],
  ['fireRate',        'Fire Rate'],
  ['capacity',        'Capacity'],
  ['spareMags',       'Spare Mags'],
  ['recoil',          'Recoil'],
  ['ergonomics',      'Ergonomics'],
  ['spread',          'Spread'],
  ['staggerForce',    'Stagger'],
  ['demolitionForce', 'Demo'],
]

const ARMOR_COMPARE_KEYS = [
  ['armorRating',  'Armor'],
  ['speed',        'Speed'],
  ['staminaRegen', 'Stamina'],
]

function Placeholder({ index }) {
  return (
    <div className="flex-1 border-2 border-dashed border-hd-border rounded p-4 text-center opacity-40">
      <div className="text-2xl mb-2">⊕</div>
      <div className="text-xs text-hd-text-dim font-body">Click an item<br/>to compare</div>
    </div>
  )
}

export function ComparePanel({ items }) {
  const [a, b] = items
  const diff = (a && b) ? compareItems(a, b) : {}

  const isWeapon = (i) => i && (i.fireRate !== undefined || i.blastRadius !== undefined)
  const isArmor  = (i) => i && i.armorRating !== undefined

  const compareKeys = isWeapon(a) || isWeapon(b) ? WEAPON_COMPARE_KEYS
    : isArmor(a) || isArmor(b) ? ARMOR_COMPARE_KEYS : []

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Headers */}
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((item, idx) =>
          item ? (
            <div key={idx} className="bg-hd-surface-2 border border-hd-border rounded p-3">
              <div className="font-display font-semibold text-hd-yellow text-sm leading-tight mb-1">{item.name}</div>
              <div className="flex flex-wrap gap-1">
                {item.category && <CategoryBadge category={item.category} />}
                {item.apTier   && <APBadge tier={item.apTier} />}
                {item.damageType && <DamageTypeBadge type={item.damageType} />}
              </div>
            </div>
          ) : (
            <Placeholder key={idx} index={idx} />
          )
        )}
      </div>

      {/* Stat comparison rows */}
      {compareKeys.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 pb-1 border-b border-hd-border">
            Comparison
          </div>
          {compareKeys.map(([key, label]) => {
            const d = diff[key]
            if (!d && d?.a === undefined) return null
            return (
              <div key={key} className="space-y-0.5">
                <div className="text-xs text-hd-text-dim font-body uppercase tracking-wide">{label}</div>
                <div className="grid grid-cols-2 gap-2">
                  <StatBar
                    label="" value={d?.a ?? a?.[key] ?? 0}
                    statKey={key} displayValue={d?.a ?? a?.[key] ?? '—'}
                    deltaA={d?.a} deltaB={d?.b} isA={true}
                  />
                  <StatBar
                    label="" value={d?.b ?? b?.[key] ?? 0}
                    statKey={key} displayValue={d?.b ?? b?.[key] ?? '—'}
                    deltaA={d?.a} deltaB={d?.b} isA={false}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stratagem comparison */}
      {a?.sequence && b?.sequence && (
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 pb-1 border-b border-hd-border">
            Sequences
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[a, b].map((s, i) => (
              <div key={i}>
                <div className="text-xs text-hd-text-dim mb-1 font-body">{s?.name}</div>
                {s?.sequence && <ArrowSequence sequence={s.sequence} />}
                <div className="text-xs text-hd-text-dim mt-1 font-mono">{s?.cooldown}s CD · {s?.uses === -1 ? '∞' : `×${s?.uses}`} uses</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
