/**
 * AP tier → minimum armor tier the weapon can penetrate
 * AP1 = Unarmored/Light  (armored rating 1)
 * AP2 = Light armor      (armored rating 2)
 * AP3 = Medium armor     (armored rating 3)
 * AP4 = Heavy armor      (armored rating 4)
 * AP5 = Anti-Tank        (armored rating 5)
 */
export const AP_TIERS = {
  1: { label: 'Unarmored', color: 'hd-muted',  bg: '#2d3748' },
  2: { label: 'Light',     color: 'hd-text',   bg: '#374151' },
  3: { label: 'Medium',    color: 'hd-yellow',  bg: '#92400e' },
  4: { label: 'Heavy',     color: 'hd-orange',  bg: '#7c2d12' },
  5: { label: 'Anti-Tank', color: 'hd-red',     bg: '#7f1d1d' },
}

export const DAMAGE_TYPES = {
  Ballistic: { color: '#9ca3af', icon: '🔫' },
  Explosive: { color: '#f59e0b', icon: '💥' },
  Fire:      { color: '#ef4444', icon: '🔥' },
  Arc:       { color: '#a78bfa', icon: '⚡' },
  Laser:     { color: '#34d399', icon: '🔆' },
  None:      { color: '#4b5563', icon: '○' },
}

// Max reference values for stat bar normalization
const MAX_VALUES = {
  damage:         600,
  durableDamage:  500,
  dps:            1200,
  fireRate:       1000,
  capacity:       200,
  spareMags:      15,
  recoil:         100,
  ergonomics:     100,
  staggerForce:   200,
  demolitionForce:200,
  pushForce:      200,
  initialVelocity:1000,
  spread:         15,
  sway:           5,
  // armor
  armorRating:    200,
  speed:          550,
  staminaRegen:   125,
}

/**
 * Normalize a stat value to 0–100 for display in stat bars.
 * For "lower is better" stats, inverts the scale.
 */
export function normalizeStat(key, value, invert = false) {
  const max = MAX_VALUES[key] ?? 100
  const pct = Math.min(100, (value / max) * 100)
  return invert ? 100 - pct : pct
}

/**
 * Penetration multiplier based on AP tier vs enemy armor tier.
 * Matches real HD2 penetration model:
 *   AP >= enemy+2  → 100% (massive over-penetration)
 *   AP == enemy+1  → 100% (over-penetration)
 *   AP == enemy    → 75%  (matched penetration)
 *   AP == enemy-1  → 10%  (partial, barely scratching)
 *   AP <= enemy-2  → 0%   (bounces off)
 */
const PEN_MULT = { 2: 1.0, 1: 1.0, 0: 0.75, '-1': 0.10, '-2': 0 }

export function penetrationMultiplier(weaponAP, enemyAP) {
  if (weaponAP === undefined || weaponAP === null) return 1.0
  const diff = (weaponAP ?? 1) - enemyAP
  return PEN_MULT[Math.max(-2, Math.min(2, diff))] ?? 0
}

/**
 * Calculate effective DPS considering penetration.
 */
export function effectiveDPS(weapon, enemyArmorTier) {
  if (!weapon || !enemyArmorTier) return weapon?.dps ?? 0
  const mult = penetrationMultiplier(weapon.apTier, enemyArmorTier)
  return Math.round(weapon.dps * mult)
}

/**
 * Score a weapon against a list of enemy types.
 * Returns 0-100 effectiveness score.
 */
export function weaponEffectivenessScore(weapon, enemies, factions) {
  if (!enemies?.length && !factions?.length) return null

  let totalScore = 0
  let checks = 0

  // Penetration score per enemy
  if (enemies?.length) {
    for (const enemy of enemies) {
      const eff = effectiveDPS(weapon, enemy.armorTier)
      const maxDps = weapon.dps || 1
      totalScore += Math.min(100, (eff / maxDps) * 100)
      checks++
    }
  }

  // Damage type bonus vs faction weaknesses
  if (factions?.length) {
    for (const faction of factions) {
      if (faction.weaknesses?.includes(weapon.damageType)) {
        totalScore += 25
        checks += 0.5
      }
      if (faction.resistances?.includes(weapon.damageType)) {
        totalScore -= 25
        checks += 0.5
      }
    }
  }

  return checks > 0 ? Math.max(0, Math.min(100, Math.round(totalScore / Math.max(1, checks - (factions?.length ?? 0) * 0.5)))) : null
}

/**
 * Score a stratagem against selected enemies and factions.
 */
export function stratagemEffectivenessScore(stratagem, enemies, factions) {
  if (!enemies?.length && !factions?.length) return null

  let score = 50 // baseline
  const tags = stratagem.tags ?? []

  if (enemies?.length) {
    for (const enemy of enemies) {
      if (enemy.class === 'Titan' || enemy.class === 'Heavy') {
        if (tags.some(t => ['Anti-Tank','Anti-Heavy','Anti-Structure'].includes(t))) score += 20
      }
      if (enemy.class === 'Light' || enemy.class === 'Medium') {
        if (tags.some(t => ['Anti-Light','Anti-Medium','Area Denial'].includes(t))) score += 15
      }
    }
  }

  if (factions?.length) {
    for (const faction of factions) {
      if (tags.includes(faction.name) || tags.includes('All Factions')) score += 10
    }
  }

  return Math.min(100, score)
}

/**
 * Compare two items — returns an object with delta for each shared numeric stat.
 * Positive = item A is better, negative = item B is better.
 * "Better" meaning: higher for damage/dps/etc, lower for recoil/spread.
 */
const LOWER_IS_BETTER = ['recoil', 'recoilH', 'recoilV', 'spread', 'sway']

export function compareItems(a, b) {
  if (!a || !b) return {}
  const keys = Object.keys(a).filter(k => typeof a[k] === 'number' && typeof b[k] === 'number')
  return Object.fromEntries(keys.map(k => {
    const diff = a[k] - b[k]
    const better = LOWER_IS_BETTER.includes(k) ? -diff : diff
    return [k, { a: a[k], b: b[k], delta: diff, aBetter: better > 0, bBetter: better < 0 }]
  }))
}

/**
 * Recommend armor passives based on selected conditions.
 */
export function recommendedPassivesForConditions(conditions, passivesData) {
  const recommended = new Set()
  for (const cond of conditions) {
    if (cond.recommendedPassive) recommended.add(cond.recommendedPassive)
  }
  return [...recommended]
}

/**
 * Recommend armor passives based on selected factions.
 */
export function recommendedPassivesForFactions(factions, passivesData) {
  const recommended = new Set()
  for (const [key, passive] of Object.entries(passivesData)) {
    for (const faction of factions) {
      if (passive.factionBonus === faction.id) recommended.add(key)
    }
  }
  return [...recommended]
}
