/**
 * Super Earth Quartermaster — Loadout Suggestion Engine
 *
 * Scores every item in every slot against:
 *  - Selected factions & their weaknesses/resistances
 *  - Selected enemy units & their armor tiers
 *  - Planet environmental conditions
 *  - Mission type priorities
 *
 * Returns a fully recommended loadout with explanation strings.
 */

import { weaponEffectivenessScore, stratagemEffectivenessScore } from './statCalc'

// ─── Helpers ────────────────────────────────────────────────────────────────

function tagOverlap(itemTags = [], targetTags = []) {
  return itemTags.filter(t => targetTags.includes(t)).length
}

// ─── Weapon scorer ───────────────────────────────────────────────────────────

function scoreWeapon(weapon, { factions, enemies, conditions, mission }) {
  let score = 50

  // AP penetration vs enemies
  if (enemies.length) {
    const eff = weaponEffectivenessScore(weapon, enemies, factions)
    if (eff !== null) score += (eff - 50) * 0.5 // -25 to +25
  }

  // Damage type vs faction weaknesses/resistances
  for (const faction of factions) {
    if (faction.weaknesses?.includes(weapon.damageType))  score += 15
    if (faction.resistances?.includes(weapon.damageType)) score -= 20
  }

  // Mission priorities
  if (mission) {
    if (mission.priorities.includes('Anti-Heavy') && weapon.apTier >= 4) score += 10
    if (mission.priorities.includes('Area Denial') && weapon.traits?.includes('Explosive')) score += 10
    if (mission.priorities.includes('High Capacity') && weapon.capacity >= 30) score += 8
    if (mission.priorities.includes('Mobility') && (weapon.capacity >= 30 || weapon.category === 'NRG')) score += 5
    if (mission.priorities.includes('Explosive') && weapon.damageType === 'Explosive') score += 12
    if (mission.priorities.includes('Precision') && weapon.category === 'DMR') score += 10
    if (mission.priorities.includes('Crowd Control') && weapon.effect === 'Stun') score += 15
  }

  // Condition bonuses
  for (const cond of conditions) {
    if (cond.id === 'fire_tornados' && weapon.damageType === 'Fire') score -= 5 // already lots of fire
    if (cond.id === 'electrical_storms' && weapon.damageType === 'Arc') score -= 5
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Armor scorer ───────────────────────────────────────────────────────────

function scoreArmor(armor, passivesData, { factions, conditions, mission }) {
  let score = 50
  const passive = passivesData[armor.passive]

  // Passive faction bonus
  if (passive?.factionBonus) {
    if (factions.some(f => f.id === passive.factionBonus)) score += 25
  }

  // Passive environment bonus
  if (passive?.environmentBonus) {
    if (conditions.some(c => c.id === passive.environmentBonus)) score += 30
  }

  // Mission-driven type preferences
  if (mission) {
    if (mission.priorities.includes('Mobility') && armor.type === 'Light')  score += 15
    if (mission.priorities.includes('Defense')  && armor.type === 'Heavy')  score += 10
    if (mission.priorities.includes('Defense')  && armor.passive === 'Fortified') score += 10
    if (mission.priorities.includes('Survivability') && armor.armorRating >= 150) score += 10
    if (mission.priorities.includes('Crowd Control') && armor.passive === 'Engineering Kit') score += 5
    if (mission.priorities.includes('Explosive') && armor.passive === 'Engineering Kit') score += 10
    if (mission.priorities.includes('Anti-Heavy') && armor.passive === 'Servo-Assisted') score += 8
    if (mission.priorities.includes('Sentry') && armor.passive === 'Engineering Kit') score += 5
  }

  // Condition-specific passives
  for (const cond of conditions) {
    if (cond.recommendedPassive === armor.passive) score += 20
  }

  // Faction-specific passives
  for (const faction of factions) {
    if (faction.id === 'automatons' && ['Fortified', 'Ballistic Padding', 'Unflinching'].includes(armor.passive)) score += 12
    if (faction.id === 'terminids' && ['Inflammable', 'Engineering Kit', 'Advanced Filtration'].includes(armor.passive)) score += 10
    if (faction.id === 'illuminate' && ['Electrical Conduit', 'Scout', 'Democracy Protects'].includes(armor.passive)) score += 10
  }

  return Math.max(0, Math.min(100, score))
}

// ─── Stratagem scorer ────────────────────────────────────────────────────────

function scoreStratagem(strat, { factions, enemies, conditions, mission }) {
  let score = stratagemEffectivenessScore(strat, enemies, factions) ?? 50
  const tags = strat.tags ?? []

  // Mission priority tag overlap
  if (mission) {
    score += tagOverlap(tags, mission.stratagemTags) * 10
    if (mission.priorities.includes('Sentry') && strat.category === 'Sentry') score += 15
    if (mission.priorities.includes('Defense') && strat.category === 'Emplacement') score += 10
    if (mission.priorities.includes('Anti-Structure') && tags.includes('Anti-Structure')) score += 15
    if (mission.priorities.includes('Mobility') && tags.includes('Mobility')) score += 15
    if (mission.priorities.includes('Crowd Control') && tags.includes('Crowd Control')) score += 15
    if (mission.priorities.includes('Survivability') && ['shield-generator-pack'].includes(strat.id)) score += 15
  }

  // Condition bonuses
  for (const cond of conditions) {
    if (cond.recommendedStratagem === strat.id) score += 20
  }

  // Faction bonuses
  for (const faction of factions) {
    if (tags.includes(faction.name)) score += 10
    if (tags.includes('All Factions')) score += 3
  }

  // Enemy tier bonuses
  const hasHeavies = enemies.some(e => e.armorTier >= 5)
  const hasMediums = enemies.some(e => e.armorTier >= 3 && e.armorTier < 5)

  if (hasHeavies && tags.some(t => ['Anti-Tank','Anti-Heavy'].includes(t))) score += 20
  if (hasMediums && tags.some(t => ['Anti-Medium','Anti-Heavy'].includes(t))) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── Booster scorer ──────────────────────────────────────────────────────────

function scoreBooster(booster, { factions, conditions, mission }) {
  let score = 50
  const tags = booster.tags ?? []

  if (mission) {
    if (mission.priorities.includes('Mobility')      && tags.includes('Mobility'))     score += 20
    if (mission.priorities.includes('Survivability') && tags.includes('Survivability')) score += 20
    if (mission.priorities.includes('Anti-Heavy')    && booster.id === 'stamina-enhancement') score += 5
  }

  // Condition bonuses
  for (const cond of conditions) {
    if (cond.id === 'extreme_cold' && booster.id === 'stamina-enhancement') score += 20
    if (cond.id === 'blizzards'    && booster.id === 'stamina-enhancement') score += 15
  }

  // General favorites
  if (booster.id === 'hellpod-space-optimization') score += 10
  if (booster.id === 'vitality-enhancement') score += 8

  return Math.max(0, Math.min(100, score))
}

// ─── Rationale builder ───────────────────────────────────────────────────────

function buildRationale(item, score, context) {
  const reasons = []
  const { factions, enemies, conditions, mission } = context

  if (item.apTier >= 4 && enemies.some(e => e.armorTier >= 4)) {
    reasons.push(`AP${item.apTier} penetrates heavy armor targets`)
  }
  if (item.damageType && factions.some(f => f.weaknesses?.includes(item.damageType))) {
    reasons.push(`${item.damageType} damage exploits faction weakness`)
  }
  if (item.passive) {
    const matchesCond = conditions.some(c => c.recommendedPassive === item.passive)
    const matchesFaction = factions.some(f => {
      if (f.id === 'terminids') return ['Inflammable','Engineering Kit'].includes(item.passive)
      if (f.id === 'automatons') return ['Fortified','Ballistic Padding'].includes(item.passive)
      if (f.id === 'illuminate') return ['Electrical Conduit'].includes(item.passive)
      return false
    })
    if (matchesCond) reasons.push(`${item.passive} counters current planet conditions`)
    if (matchesFaction) reasons.push(`${item.passive} effective vs selected faction`)
  }
  if (mission && item.tags?.some(t => mission.stratagemTags?.includes(t))) {
    reasons.push(`Aligns with ${mission.name} mission priorities`)
  }
  if (item.sequence && enemies.some(e => e.armorTier >= 5) && item.tags?.some(t => ['Anti-Tank','Anti-Heavy'].includes(t))) {
    reasons.push('Essential vs heavy/titan-class enemies')
  }

  return reasons.length ? reasons : [`Score: ${score}/100`]
}

// ─── Main suggestion function ─────────────────────────────────────────────────

export function suggestLoadout({
  weapons, armor: armorList, stratagems, boosters,
  passivesData,
  factions, enemies, conditions, mission,
}) {
  const ctx = { factions, enemies, conditions, mission }

  // Score all items in each category
  const scoredPrimaries   = weapons.primaries.map(w   => ({ item: w, score: scoreWeapon(w, ctx), rationale: [] }))
  const scoredSecondaries = weapons.secondaries.map(w => ({ item: w, score: scoreWeapon(w, ctx), rationale: [] }))
  const scoredThrowables  = weapons.throwables.map(w  => ({ item: w, score: scoreWeapon(w, ctx), rationale: [] }))
  const scoredArmor       = armorList.map(a            => ({ item: a, score: scoreArmor(a, passivesData, ctx), rationale: [] }))
  const scoredStratagems  = stratagems.map(s           => ({ item: s, score: scoreStratagem(s, ctx), rationale: [] }))
  const scoredBoosters    = boosters.map(b             => ({ item: b, score: scoreBooster(b, ctx), rationale: [] }))

  // Pick top items
  const top = arr => [...arr].sort((a, b) => b.score - a.score)

  const primary   = top(scoredPrimaries)[0]
  const secondary = top(scoredSecondaries)[0]
  const throwable = top(scoredThrowables)[0]
  const armor     = top(scoredArmor)[0]
  const booster   = top(scoredBoosters)[0]

  // Pick top 4 stratagems ensuring category diversity (no more than 2 of same category)
  const sortedStrats = top(scoredStratagems)
  const pickedStrats = []
  const catCounts = {}
  for (const s of sortedStrats) {
    const cat = s.item.category
    if ((catCounts[cat] ?? 0) >= 2) continue
    pickedStrats.push(s)
    catCounts[cat] = (catCounts[cat] ?? 0) + 1
    if (pickedStrats.length === 4) break
  }

  // Build rationale for each pick
  const addRationale = (scored) => ({
    ...scored,
    rationale: buildRationale(scored.item, scored.score, ctx),
  })

  return {
    primary:    addRationale(primary),
    secondary:  addRationale(secondary),
    throwable:  addRationale(throwable),
    armor:      addRationale(armor),
    stratagems: pickedStrats.map(addRationale),
    booster:    addRationale(booster),

    // Top alternatives for each slot
    alternatives: {
      primary:    top(scoredPrimaries).slice(1, 4).map(s => s.item),
      secondary:  top(scoredSecondaries).slice(1, 3).map(s => s.item),
      throwable:  top(scoredThrowables).slice(1, 3).map(s => s.item),
      armor:      top(scoredArmor).slice(1, 3).map(s => s.item),
      stratagems: top(scoredStratagems).slice(4, 8).map(s => s.item),
      booster:    top(scoredBoosters).slice(1, 3).map(s => s.item),
    }
  }
}
