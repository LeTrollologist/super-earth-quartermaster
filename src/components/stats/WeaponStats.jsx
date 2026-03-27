import { APBadge } from '../ui/APBadge'
import { DamageTypeBadge } from '../ui/DamageTypeBadge'
import { CategoryBadge } from '../ui/CategoryBadge'
import { StatBar } from './StatBar'

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

export function WeaponStats({ weapon, effectivenessScore }) {
  if (!weapon) return null

  const isGrenade  = weapon.category === 'Grenade'
  const isEnergy   = weapon.traits?.includes('No Reload')
  const isMelee    = weapon.category === 'MELEE'

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-display text-lg font-bold text-hd-yellow leading-tight">{weapon.name}</h2>
          {effectivenessScore !== null && effectivenessScore !== undefined && (
            <div className={`shrink-0 text-xs font-mono px-2 py-1 rounded border ${
              effectivenessScore >= 70 ? 'border-green-600 text-green-400 bg-green-900/30' :
              effectivenessScore >= 40 ? 'border-yellow-600 text-yellow-400 bg-yellow-900/30' :
                                         'border-red-600 text-red-400 bg-red-900/30'
            }`}>
              {effectivenessScore}% vs enemies
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge category={weapon.category} />
          <APBadge tier={weapon.apTier} />
          <DamageTypeBadge type={weapon.damageType} />
          {weapon.effect && (
            <span className="px-2 py-0.5 text-xs border border-purple-700 text-purple-300 rounded font-mono bg-purple-900/30">
              {weapon.effect}
            </span>
          )}
        </div>
        {weapon.traits?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {weapon.traits.map(t => (
              <span key={t} className="px-1.5 py-0.5 text-xs bg-hd-surface-2 border border-hd-border text-hd-text-dim rounded font-mono">
                {t}
              </span>
            ))}
          </div>
        )}
        {weapon.warbond && (
          <div className="text-xs text-hd-text-dim mt-1 font-body">
            <span className="text-hd-yellow/50">Warbond: </span>{weapon.warbond}
          </div>
        )}
      </div>

      {/* Damage */}
      <Section title="Damage">
        <StatBar label="Damage"       value={weapon.damage}        statKey="damage"        displayValue={`${weapon.damage}`} />
        <StatBar label="Durable DMG"  value={weapon.durableDamage} statKey="durableDamage" displayValue={`${weapon.durableDamage}`} />
        {!isGrenade && !isMelee && (
          <StatBar label="DPS"         value={weapon.dps}           statKey="dps"           displayValue={`${weapon.dps}`} />
        )}
        {isGrenade && (
          <StatBar label="Blast Radius" value={weapon.blastRadius ?? 0} statKey="damage" displayValue={`${weapon.blastRadius ?? 0}m`} />
        )}
      </Section>

      {/* Firepower (guns only) */}
      {!isGrenade && !isMelee && !isEnergy && (
        <Section title="Firepower">
          {weapon.fireRate > 0 && (
            <StatBar label="Fire Rate"  value={weapon.fireRate}  statKey="fireRate"  displayValue={`${weapon.fireRate} rpm`} />
          )}
          <StatBar label="Capacity"   value={weapon.capacity}  statKey="capacity"  displayValue={`${weapon.capacity} rnd`} />
          {!isEnergy && (
            <StatBar label="Spare Mags" value={weapon.spareMags} statKey="spareMags" displayValue={`×${weapon.spareMags}`} />
          )}
        </Section>
      )}

      {/* Handling (guns only) */}
      {!isGrenade && !isMelee && (
        <Section title="Handling">
          {!isEnergy && (
            <StatBar label="Recoil"      value={weapon.recoil}      statKey="recoil"      displayValue={`${weapon.recoil}`} />
          )}
          <StatBar label="Ergonomics"  value={weapon.ergonomics}  statKey="ergonomics"  displayValue={`${weapon.ergonomics}`} />
          {!isEnergy && (
            <>
              <StatBar label="Spread"    value={weapon.spread}    statKey="spread"    displayValue={`${weapon.spread}°`} />
              <StatBar label="Sway"      value={weapon.sway}      statKey="sway"      displayValue={`${weapon.sway}`} />
            </>
          )}
          {weapon.initialVelocity < 99999 && (
            <StatBar label="Velocity"    value={weapon.initialVelocity} statKey="initialVelocity" displayValue={`${weapon.initialVelocity} m/s`} />
          )}
        </Section>
      )}

      {/* Impact */}
      {(weapon.staggerForce !== undefined || weapon.demolitionForce !== undefined) && (
        <Section title="Impact">
          {weapon.staggerForce    !== undefined && <StatBar label="Stagger" value={weapon.staggerForce}    statKey="staggerForce"    displayValue={`${weapon.staggerForce}`} />}
          {weapon.demolitionForce !== undefined && <StatBar label="Demo"    value={weapon.demolitionForce} statKey="demolitionForce" displayValue={`${weapon.demolitionForce}`} />}
          {weapon.pushForce       !== undefined && <StatBar label="Push"    value={weapon.pushForce}       statKey="pushForce"       displayValue={`${weapon.pushForce}`} />}
        </Section>
      )}

      {/* Grenade specifics */}
      {isGrenade && (
        <Section title="Grenade">
          {weapon.fuseTime !== undefined && (
            <div className="flex justify-between text-xs font-mono py-1">
              <span className="text-hd-text-dim uppercase tracking-wide">Fuse Time</span>
              <span className="text-hd-text">{weapon.fuseTime === 0 ? 'Impact' : `${weapon.fuseTime}s`}</span>
            </div>
          )}
          {weapon.count !== undefined && (
            <div className="flex justify-between text-xs font-mono py-1">
              <span className="text-hd-text-dim uppercase tracking-wide">Carry Limit</span>
              <span className="text-hd-text">×{weapon.count}</span>
            </div>
          )}
        </Section>
      )}
    </div>
  )
}
