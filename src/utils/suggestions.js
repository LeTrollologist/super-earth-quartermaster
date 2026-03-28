/**
 * Super Earth Quartermaster — Suggestion Engine v3
 * Supports: faction, enemy, condition, mission, playstyle, loadout synergy, build-around,
 *           difficulty scaling, proportional synergy, de-weighting, cooldown penalties,
 *           dimension breakdowns, squad exclusion
 */

import { penetrationMultiplier } from './statCalc'

// ── Synergy weight helper ───────────────────────────────────────────────────
// When a synergy mode is toggled OFF, it still contributes at 0.3× (dim, not dead)
function synergyWeight(mode, synergyModes) {
  if (!synergyModes) return 1.0
  return synergyModes[mode] === false ? 0.3 : 1.0
}

// ── Faction tag helpers ───────────────────────────────────────────────────────
const FACTION_TAGS = {
  terminids:  ['Terminids', 'Anti-Light', 'Fire', 'Area Denial'],
  automatons: ['Automatons', 'Anti-Heavy', 'Anti-Tank', 'Precision'],
  illuminate: ['Illuminate', 'Arc', 'Energy', 'Anti-Light'],
}

function factionTagOverlap(tags = [], factionIds = []) {
  if (!factionIds.length) return 0
  let hits = 0
  let totalTags = 0
  for (const fid of factionIds) {
    const fTags = FACTION_TAGS[fid] ?? []
    totalTags += fTags.length
    for (const t of fTags) {
      if (tags.includes(t)) hits++
    }
  }
  // Proportional: scale by how many tags matched out of possible
  if (totalTags === 0) return 0
  return Math.round((hits / totalTags) * 45)
}

// ── Mission priorities ────────────────────────────────────────────────────────
const MISSION_WEIGHTS = {
  'eradicate':                    { area: 15, antiLight: 15, antiHeavy: 0,  armorType: { Light: 3,  Medium: 5,  Heavy: -5  } },
  'blitz':                        { area: 5,  antiLight: 5,  antiHeavy: 5,  armorType: { Light: 10, Medium: 0,  Heavy: -15 } },
  'defend':                       { area: 10, antiLight: 5,  antiHeavy: 10, armorType: { Light: -5, Medium: 5,  Heavy: 10  } },
  'sabotage':                     { area: 0,  antiLight: 5,  antiHeavy: 10, armorType: { Light: 5,  Medium: 5,  Heavy: 0   } },
  'retrieve-essential-personnel': { area: 0,  antiLight: 5,  antiHeavy: 5,  armorType: { Light: 10, Medium: 0,  Heavy: -10 } },
  'eliminate-target':             { area: 0,  antiLight: 0,  antiHeavy: 20, armorType: { Light: 5,  Medium: 5,  Heavy: 5   } },
  'activate-tcs':                 { area: 10, antiLight: 10, antiHeavy: 5,  armorType: { Light: -5, Medium: 5,  Heavy: 10  } },
  'spread-democracy':             { area: 5,  antiLight: 5,  antiHeavy: 5,  armorType: { Light: 0,  Medium: 5,  Heavy: 5   } },
}

// ── Condition helpers ─────────────────────────────────────────────────────────
const CONDITION_PASSIVE_BONUS = {
  fire_tornados:      ['Inflammable'],
  extreme_cold:       ['Acclimated'],
  toxic_haze:         ['Advanced Filtration'],
  acid_storms:        ['Advanced Filtration'],
  blizzards:          ['Acclimated'],
  electrical_storms:  ['Electrical Conduit'],
  meteor_showers:     ['Engineering Kit'],
  extreme_heat:       ['Inflammable'],
  thick_fog:          ['Scout'],
  rainstorm:          [],
  sandstorm:          ['Advanced Filtration', 'Scout'],
  spore_clouds:       ['Advanced Filtration'],
  volcanic_activity:  ['Inflammable'],
  ion_storms:         ['Electrical Conduit'],
  stalker_infestation:['Scout'],
  orbital_interference: [],
}

// Proportional condition bonus: if n conditions selected and item matches k, score = (k/n)*40
function conditionPassiveBonus(passive, conditions) {
  if (!passive || !conditions?.length) return 0
  let matches = 0
  for (const cond of conditions) {
    if (CONDITION_PASSIVE_BONUS[cond]?.includes(passive)) matches++
  }
  if (matches === 0) return 0
  return Math.round((matches / conditions.length) * 40)
}

// ── Difficulty scaling ──────────────────────────────────────────────────────
const DIFFICULTY_LABELS = ['Trivial','Easy','Medium','Challenging','Hard','Extreme','Suicide Mission','Impossible','Helldive']

function difficultyMods(difficulty) {
  if (!difficulty || difficulty <= 0) return { atBonus: 0, areaBonus: 0, lightArmorPenalty: 0, heavyArmorBonus: 0, heavyWeaponPenalty: 0, fastCooldownBonus: 0 }
  if (difficulty >= 7) return { atBonus: 15, areaBonus: 10, lightArmorPenalty: -10, heavyArmorBonus: 8, heavyWeaponPenalty: 0, fastCooldownBonus: 0 }
  if (difficulty <= 3) return { atBonus: 0, areaBonus: 0, lightArmorPenalty: 0, heavyArmorBonus: 0, heavyWeaponPenalty: -10, fastCooldownBonus: 5 }
  return { atBonus: 0, areaBonus: 0, lightArmorPenalty: 0, heavyArmorBonus: 0, heavyWeaponPenalty: 0, fastCooldownBonus: 0 }
}

// ── Playstyle helpers ─────────────────────────────────────────────────────────
function playstyleWeaponBonus(weapon, playstyle) {
  if (!playstyle) return 0
  let score = 0
  const traits = weapon.traits ?? []
  for (const pt of (playstyle.primaryTraits ?? [])) {
    if (traits.includes(pt) || weapon.damageType === pt || weapon.effect === pt) score += 12
  }
  for (const at of (playstyle.avoidTraits ?? [])) {
    if (traits.includes(at) || weapon.damageType === at) score -= 8
  }
  return Math.max(score, -20)
}

function playstyleArmorBonus(armor, playstyle) {
  if (!playstyle) return 0
  let score = 0
  if (playstyle.preferredArmor?.includes(armor.passive)) score += 20
  score += playstyle.armorTypeBonus?.[armor.type] ?? 0
  return score
}

function playstyleStratagemBonus(stratagem, playstyle) {
  if (!playstyle) return 0
  let score = 0
  const tags = stratagem.tags ?? []
  for (const pt of (playstyle.preferredStratagemTags ?? [])) {
    if (tags.includes(pt)) score += 10
  }
  if (playstyle.favoredStratagems?.includes(stratagem.id)) score += 25
  return score
}

// ── Weapon/Stratagem profile helpers for loadout synergy ─────────────────────
function getWeaponProfile(weapon) {
  if (!weapon) return {}
  return {
    isHighROF:    (weapon.fireRate ?? 0) >= 600,
    isLowROF:     (weapon.fireRate ?? 0) > 0 && (weapon.fireRate ?? 0) < 200,
    isAT:         (weapon.apTier ?? 0) >= 5,
    isHeavy:      (weapon.apTier ?? 0) >= 4,
    isFire:       weapon.damageType === 'Fire',
    isArc:        weapon.damageType === 'Arc',
    isExplosive:  weapon.damageType === 'Explosive' || (weapon.traits ?? []).includes('Explosive'),
    isArea:       (weapon.traits ?? []).some(t => ['Area','Wide Spread','DoT'].includes(t)),
    isSingleShot: (weapon.traits ?? []).includes('Single Fire'),
  }
}

function getStratagemProfile(st) {
  const tags = st.tags ?? []
  return {
    isAT:      tags.includes('Anti-Tank'),
    isArea:    tags.includes('Area Denial'),
    isFire:    tags.includes('Fire'),
    isLight:   tags.includes('Anti-Light'),
  }
}

function loadoutSynergyBonus(candidateItem, candidateSlot, buildAround, currentSlots) {
  let bonus = 0
  const lockedWeapons = []
  if (buildAround?.item && ['primary','secondary'].includes(buildAround.slotType))
    lockedWeapons.push(buildAround.item)
  if (currentSlots?.primary)   lockedWeapons.push(currentSlots.primary)
  if (currentSlots?.secondary) lockedWeapons.push(currentSlots.secondary)

  for (const anchor of lockedWeapons) {
    if (anchor.id === candidateItem.id) continue
    const ap = getWeaponProfile(anchor)

    if (['primary','secondary'].includes(candidateSlot)) {
      if (ap.isLowROF && !ap.isHighROF && (candidateItem.fireRate ?? 0) >= 600) bonus += 20
      if (ap.isHighROF && !ap.isLowROF  && (candidateItem.fireRate ?? 0) < 200) bonus += 15
      if (ap.isFire  && candidateItem.damageType === 'Fire')  bonus -= 20
      if (ap.isArc   && candidateItem.damageType === 'Arc')   bonus -= 15
      if (ap.isArea  && (candidateItem.traits ?? []).includes('High Damage')) bonus += 10
    }

    if (candidateSlot === 'stratagem') {
      const sp = getStratagemProfile(candidateItem)
      if (ap.isAT && sp.isAT) bonus -= 15
      if ((ap.isFire || ap.isArea) && sp.isAT) bonus += 15
      if (ap.isSingleShot && sp.isArea) bonus += 12
      if (!ap.isHeavy && sp.isAT) bonus += 20
    }
  }

  if (candidateSlot === 'armor' && buildAround) {
    const anchor = buildAround.item
    if (anchor?.passive === 'Scout'       && candidateItem.type === 'Light')  bonus += 15
    if (anchor?.passive === 'Inflammable' && candidateItem.passive === 'Inflammable') bonus -= 5
    const ap = getWeaponProfile(anchor)
    if (ap.isFire && candidateItem.passive === 'Inflammable') bonus += 15
    if (ap.isArc  && candidateItem.passive === 'Electrical Conduit') bonus += 10
    if (ap.isSingleShot && candidateItem.type === 'Light') bonus += 8
  }

  return Math.max(Math.min(bonus, 40), -30)
}

// ── Cooldown conflict penalty ───────────────────────────────────────────────
function cooldownConflictPenalty(candidate, currentStratagems) {
  if (!currentStratagems?.length) return 0
  const filled = currentStratagems.filter(Boolean)
  if (filled.length === 0) return 0

  const allCDs = [...filled.map(s => s.cooldown ?? 0), candidate.cooldown ?? 0]
  const heavyCDs = allCDs.filter(cd => cd > 90)
  let penalty = 0

  // 3+ heavy-cooldown stratagems is bad
  if (heavyCDs.length >= 3) penalty -= 15
  // All same cooldown tier is boring/suboptimal
  if (allCDs.length >= 3 && new Set(allCDs.map(cd => Math.floor(cd / 60))).size === 1) penalty -= 10
  // Mix of fast + slow is good
  if (allCDs.some(cd => cd < 60) && allCDs.some(cd => cd > 180)) penalty += 8

  return penalty
}

// ── Synergy stacking bonus ────────────────────────────────────────────────────
function synergyStackBonus(contribs, synergyModes) {
  if (!synergyModes) return 0
  const activeModes = Object.values(synergyModes).filter(v => v !== false).length
  if (activeModes < 2) return 0
  const positiveCount = contribs.filter(c => c > 0).length
  if (positiveCount < 3) return 0
  return (positiveCount - 2) * 8
}

// ── Item scorers ──────────────────────────────────────────────────────────────
// Each scorer returns { total, dimensions } where dimensions shows per-synergy contributions

function scoreWeapon(weapon, ctx) {
  const { enemies, factions, conditions, mission, playstyle, synergyModes, buildAround, currentSlots, slotType, difficulty } = ctx
  let score = 50
  let factionC = 0, missionC = 0, playstyleC = 0, loadoutC = 0, diffC = 0

  // Faction synergy
  if (enemies.length || factions.length) {
    // Proportional AP scoring: average penetration multiplier across selected enemies
    if (enemies.length) {
      const avgPen = enemies.reduce((sum, e) => sum + penetrationMultiplier(weapon.apTier, e.armorTier ?? 1), 0) / enemies.length
      if (avgPen < 0.3) factionC -= Math.round((1 - avgPen) * 30)
      else if (avgPen > 0.8) factionC += 10
    }
    factionC += factionTagOverlap(weapon.traits ?? [], factions.map(f => f.id))
    if (factions.some(f => f.id === 'terminids') && weapon.damageType === 'Fire')       factionC += 15
    if (factions.some(f => f.id === 'automatons') && weapon.damageType === 'Explosive') factionC += 10
    if (factions.some(f => f.id === 'illuminate') && weapon.damageType === 'Arc')       factionC += 15
    // Enemy weakness/resistance bonus
    if (enemies.length && weapon.damageType) {
      const weakHits = enemies.filter(e => e.weaknesses?.includes(weapon.damageType)).length
      const resistHits = enemies.filter(e => e.resistances?.includes(weapon.damageType)).length
      factionC += Math.round((weakHits / enemies.length) * 15)
      factionC -= Math.round((resistHits / enemies.length) * 15)
    }
  }
  score += factionC * synergyWeight('faction', synergyModes)

  // Mission synergy
  if (mission) {
    const mw = MISSION_WEIGHTS[mission]
    if (mw) {
      const traits = weapon.traits ?? []
      if (traits.some(t => ['Area','DoT','Explosive'].includes(t)) || (weapon.fireRate ?? 0) >= 600) missionC += mw.area
      if (traits.some(t => ['Anti-Light','High Stagger','Fire'].includes(t))) missionC += mw.antiLight
      if ((weapon.apTier ?? 0) >= 4 || traits.some(t => ['Anti-Heavy','Anti-Tank'].includes(t))) missionC += mw.antiHeavy
    }
    if (['blitz','retrieve-essential-personnel'].includes(mission) && (weapon.fireRate ?? 0) >= 600) missionC += 5
  }
  score += missionC * synergyWeight('mission', synergyModes)

  // Playstyle synergy
  if (playstyle) {
    playstyleC = playstyleWeaponBonus(weapon, playstyle)
  }
  score += playstyleC * synergyWeight('playstyle', synergyModes)

  // Loadout synergy
  loadoutC = loadoutSynergyBonus(weapon, slotType, buildAround, currentSlots)
  score += loadoutC * synergyWeight('loadout', synergyModes)

  // Difficulty scaling
  const dm = difficultyMods(difficulty)
  if ((weapon.apTier ?? 0) >= 4) diffC += dm.atBonus
  if ((weapon.traits ?? []).some(t => ['Area','DoT'].includes(t))) diffC += dm.areaBonus
  if ((weapon.apTier ?? 0) >= 5) diffC += dm.heavyWeaponPenalty
  score += diffC

  score += synergyStackBonus([factionC, missionC, playstyleC, loadoutC], synergyModes)

  const total = Math.min(Math.max(Math.round(score), 0), 100)
  return { total, dimensions: { faction: Math.round(factionC), mission: Math.round(missionC), playstyle: Math.round(playstyleC), loadout: Math.round(loadoutC), planet: 0, difficulty: Math.round(diffC) } }
}

function scoreArmor(armor, ctx) {
  const { conditions, factions, mission, playstyle, synergyModes, buildAround, currentSlots, difficulty } = ctx
  let score = 50
  let planetC = 0, factionC = 0, missionC = 0, playstyleC = 0, loadoutC = 0, diffC = 0

  // Planet synergy
  planetC = conditionPassiveBonus(armor.passive, conditions)
  score += planetC * synergyWeight('planet', synergyModes)

  // Faction synergy
  if (factions.length) {
    if (factions.some(f => f.id === 'terminids')  && armor.passive === 'Inflammable')        factionC += 10
    if (factions.some(f => f.id === 'automatons') && armor.passive === 'Fortified')          factionC += 10
    if (factions.some(f => f.id === 'illuminate') && armor.passive === 'Electrical Conduit') factionC += 10
    if (factions.some(f => f.id === 'automatons') && ['Servo-Assisted','Unflinching'].includes(armor.passive)) factionC += 8
  }
  score += factionC * synergyWeight('faction', synergyModes)

  // Mission synergy
  if (mission) {
    const mw = MISSION_WEIGHTS[mission]
    if (mw?.armorType) missionC += mw.armorType[armor.type] ?? 0
    if (['blitz','retrieve-essential-personnel'].includes(mission) && armor.type === 'Light') missionC += 15
    if (['defend','activate-tcs'].includes(mission) && armor.type === 'Heavy') missionC += 10
    if (mission === 'eradicate' && armor.passive === 'Engineering Kit') missionC += 10
  }
  score += missionC * synergyWeight('mission', synergyModes)

  // Playstyle synergy
  if (playstyle) {
    playstyleC = playstyleArmorBonus(armor, playstyle)
  }
  score += playstyleC * synergyWeight('playstyle', synergyModes)

  // Loadout synergy
  loadoutC = loadoutSynergyBonus(armor, 'armor', buildAround, currentSlots)
  score += loadoutC * synergyWeight('loadout', synergyModes)

  // Difficulty scaling
  const dm = difficultyMods(difficulty)
  if (armor.type === 'Light' && armor.passive !== 'Scout') diffC += dm.lightArmorPenalty
  if (armor.type === 'Heavy' || armor.type === 'Medium') diffC += dm.heavyArmorBonus
  score += diffC

  score += synergyStackBonus([planetC, factionC, missionC, playstyleC, loadoutC], synergyModes)

  const total = Math.min(Math.max(Math.round(score), 0), 100)
  return { total, dimensions: { faction: Math.round(factionC), mission: Math.round(missionC), playstyle: Math.round(playstyleC), loadout: Math.round(loadoutC), planet: Math.round(planetC), difficulty: Math.round(diffC) } }
}

function scoreStratagem(stratagem, ctx) {
  const { enemies, factions, conditions, mission, playstyle, synergyModes, buildAround, currentSlots, difficulty } = ctx
  let score = 50
  const tags = stratagem.tags ?? []
  let factionC = 0, planetC = 0, missionC = 0, playstyleC = 0, loadoutC = 0, diffC = 0

  // Faction synergy
  factionC += factionTagOverlap(tags, factions.map(f => f.id))
  if (enemies.length) {
    const maxAP = Math.max(...enemies.map(e => e.armorTier ?? 1))
    if (maxAP >= 4 && tags.includes('Anti-Tank'))  factionC += 20
    if (maxAP >= 3 && tags.includes('Anti-Heavy')) factionC += 10
    if (maxAP <= 2 && tags.includes('Anti-Light')) factionC += 15
  }
  score += factionC * synergyWeight('faction', synergyModes)

  // Planet synergy
  if (conditions.length) {
    if (conditions.includes('ion_storms') && stratagem.cooldown > 300) planetC -= 10
    if (conditions.includes('stalker_infestation') && tags.some(t => ['Anti-Light','Automatic'].includes(t))) planetC += 15
  }
  score += planetC * synergyWeight('planet', synergyModes)

  // Mission synergy
  if (mission) {
    const mw = MISSION_WEIGHTS[mission]
    if (mw) {
      if (tags.includes('Area Denial')) missionC += mw.area
      if (tags.includes('Anti-Light'))  missionC += mw.antiLight
      if (tags.includes('Anti-Heavy') || tags.includes('Anti-Tank')) missionC += mw.antiHeavy
    }
    if (mission === 'blitz' && stratagem.cooldown < 120) missionC += 15
    if (mission === 'blitz' && ['Vehicle','Emplacement'].includes(stratagem.category)) missionC -= 15
    if (['defend','activate-tcs'].includes(mission) && ['Sentry','Emplacement'].includes(stratagem.category)) missionC += 20
    if (mission === 'eliminate-target' && tags.includes('Anti-Tank')) missionC += 20
    if (mission === 'eradicate' && tags.some(t => ['Area Denial','Anti-Light','Fire'].includes(t))) missionC += 15
  }
  score += missionC * synergyWeight('mission', synergyModes)

  // Playstyle synergy
  if (playstyle) {
    playstyleC = playstyleStratagemBonus(stratagem, playstyle)
  }
  score += playstyleC * synergyWeight('playstyle', synergyModes)

  // Loadout synergy
  loadoutC = loadoutSynergyBonus(stratagem, 'stratagem', buildAround, currentSlots)
  score += loadoutC * synergyWeight('loadout', synergyModes)

  // Cooldown conflict penalty
  loadoutC += cooldownConflictPenalty(stratagem, currentSlots?.stratagems)

  // Difficulty scaling
  const dm = difficultyMods(difficulty)
  if (tags.includes('Anti-Tank') || tags.includes('Anti-Heavy')) diffC += dm.atBonus
  if (tags.includes('Area Denial')) diffC += dm.areaBonus
  if (stratagem.cooldown < 60) diffC += dm.fastCooldownBonus
  score += diffC

  score += synergyStackBonus([factionC, planetC, missionC, playstyleC, loadoutC], synergyModes)

  const total = Math.min(Math.max(Math.round(score), 0), 100)
  return { total, dimensions: { faction: Math.round(factionC), mission: Math.round(missionC), playstyle: Math.round(playstyleC), loadout: Math.round(loadoutC), planet: Math.round(planetC), difficulty: Math.round(diffC) } }
}

// ── Booster scorer (tag-based) ──────────────────────────────────────────────
const BOOSTER_MISSION_TAGS = {
  'blitz':                        ['stamina', 'mobility', 'sprint'],
  'retrieve-essential-personnel': ['extraction', 'stamina', 'mobility'],
  'eradicate':                    ['reinforce', 'sustain', 'ammo'],
  'defend':                       ['hp', 'survivability', 'sustain'],
  'sabotage':                     ['stealth', 'recon', 'intel'],
  'eliminate-target':             ['ammo', 'combat', 'survivability'],
  'activate-tcs':                 ['reinforce', 'sustain', 'hp'],
  'spread-democracy':             ['ammo', 'resupply', 'reinforce'],
}

const BOOSTER_CONDITION_TAGS = {
  'extreme_cold':       ['stamina', 'mobility'],
  'toxic_haze':         ['hp', 'survivability'],
  'spore_clouds':       ['stamina', 'survivability'],
  'blizzards':          ['stamina', 'mobility'],
  'sandstorm':          ['recon', 'intel'],
  'thick_fog':          ['recon', 'intel'],
  'stalker_infestation':['recon', 'intel'],
}

const BOOSTER_PLAYSTYLE_TAGS = {
  'lone-wolf':     ['stamina', 'mobility', 'sprint'],
  'support-medic': ['hp', 'survivability', 'sustain'],
  'sample-goblin': ['stamina', 'mobility', 'terrain'],
  'tank-buster':   ['ammo', 'resupply', 'combat'],
  'chaff-clear':   ['ammo', 'resupply', 'combat'],
  'engineer':      ['sustain', 'reinforce'],
  'mech-pilot':    ['ammo', 'resupply'],
}

function scoreBooster(booster, ctx) {
  const { mission, conditions, playstyle, synergyModes } = ctx
  let score = 50
  const bTags = booster.scoringTags ?? []
  let missionC = 0, planetC = 0, playstyleC = 0

  // Mission
  if (mission && BOOSTER_MISSION_TAGS[mission]) {
    const mTags = BOOSTER_MISSION_TAGS[mission]
    const hits = bTags.filter(t => mTags.includes(t)).length
    missionC = hits > 0 ? Math.min(hits * 12, 25) : 0
  }
  score += missionC * synergyWeight('mission', synergyModes)

  // Planet
  if (conditions?.length) {
    let condHits = 0
    for (const cond of conditions) {
      const cTags = BOOSTER_CONDITION_TAGS[cond]
      if (cTags && bTags.some(t => cTags.includes(t))) condHits++
    }
    planetC = condHits > 0 ? Math.round((condHits / conditions.length) * 20) : 0
  }
  score += planetC * synergyWeight('planet', synergyModes)

  // Playstyle
  if (playstyle && BOOSTER_PLAYSTYLE_TAGS[playstyle.id]) {
    const pTags = BOOSTER_PLAYSTYLE_TAGS[playstyle.id]
    const hits = bTags.filter(t => pTags.includes(t)).length
    playstyleC = hits > 0 ? Math.min(hits * 10, 20) : 0
  }
  score += playstyleC * synergyWeight('playstyle', synergyModes)

  score += synergyStackBonus([missionC, planetC, playstyleC], synergyModes)

  const total = Math.min(Math.max(Math.round(score), 0), 100)
  return { total, dimensions: { faction: 0, mission: Math.round(missionC), playstyle: Math.round(playstyleC), loadout: 0, planet: Math.round(planetC), difficulty: 0 } }
}

// ── Rationale builder ─────────────────────────────────────────────────────────
function buildRationale(item, score, ctx) {
  const reasons = []
  const { factions, enemies, conditions, mission, playstyle, buildAround, difficulty } = ctx

  const isArmor     = item.armorRating !== undefined
  const isStratagem = item.sequence !== undefined
  const isBooster   = !isArmor && !isStratagem && item.fireRate === undefined && item.blastRadius === undefined

  if (isArmor) {
    if (conditions?.length && CONDITION_PASSIVE_BONUS[conditions[0]]?.includes(item.passive))
      reasons.push(`"${item.passive}" suits ${conditions[0].replace(/_/g,' ')} conditions`)
    if (['blitz','retrieve-essential-personnel'].includes(mission) && item.type === 'Light')
      reasons.push('Light armor for mobility-critical mission')
    if (['defend','activate-tcs'].includes(mission) && item.type === 'Heavy')
      reasons.push('Heavy armor for sustained defensive operations')
    if (playstyle?.preferredArmor?.includes(item.passive))
      reasons.push(`Matches ${playstyle.name} playstyle`)
    if (difficulty >= 7 && item.type === 'Heavy')
      reasons.push('Heavy armor recommended for high difficulty')
  } else if (isStratagem) {
    const tags = item.tags ?? []
    if (factions?.some(f => tags.includes(f.name ?? f.id)))
      reasons.push('Tagged for current faction threat')
    if (tags.includes('Anti-Tank') && enemies?.some(e => (e.armorTier ?? 1) >= 4))
      reasons.push('Anti-tank needed vs armored enemies')
    if (mission === 'blitz' && item.cooldown < 120)
      reasons.push('Short cooldown suits Blitz tempo')
    if (['defend','activate-tcs'].includes(mission) && ['Sentry','Emplacement'].includes(item.category))
      reasons.push('Sentry/emplacement ideal for defense')
    if (playstyle?.favoredStratagems?.includes(item.id))
      reasons.push(`Core tool for ${playstyle.name} playstyle`)
    if (difficulty >= 7 && tags.includes('Anti-Tank'))
      reasons.push('Anti-tank essential at high difficulty')
  } else if (!isBooster) {
    if (factions?.some(f => f.id === 'terminids') && item.damageType === 'Fire')
      reasons.push('Fire damage highly effective vs Terminids')
    if (factions?.some(f => f.id === 'automatons') && (item.apTier ?? 0) >= 4)
      reasons.push('High AP needed vs Automaton armor')
    if (factions?.some(f => f.id === 'illuminate') && item.damageType === 'Arc')
      reasons.push('Arc damage effective vs Illuminate shields')
    if (buildAround?.item) {
      const ap = getWeaponProfile(buildAround.item)
      if (ap.isLowROF && (item.fireRate ?? 0) >= 600)
        reasons.push(`High ROF compensates for ${buildAround.item.name}'s slow fire rate`)
      if (ap.isFire && (item.fireRate ?? 0) >= 600)
        reasons.push('Spray coverage supports anchor weapon')
    }
    if (playstyle?.primaryTraits?.some(t => (item.traits ?? []).includes(t)))
      reasons.push(`Traits aligned with ${playstyle.name} playstyle`)
    if (difficulty >= 7 && (item.apTier ?? 0) >= 4)
      reasons.push('High penetration needed for this difficulty')
  }

  if (reasons.length === 0) {
    if (score >= 70) reasons.push('Strong all-round choice for current context')
    else if (score >= 50) reasons.push('Solid performer for this loadout')
    else reasons.push('Viable — check alternatives for better fit')
  }

  return reasons
}

// ── Score current loadout (for live synergy display) ────────────────────────
export function scoreCurrentLoadout(slots, ctx) {
  if (!slots) return null
  const items = []

  if (slots.primary)   items.push({ item: slots.primary,   scored: scoreWeapon(slots.primary, { ...ctx, slotType: 'primary' }) })
  if (slots.secondary) items.push({ item: slots.secondary, scored: scoreWeapon(slots.secondary, { ...ctx, slotType: 'secondary' }) })
  if (slots.throwable) items.push({ item: slots.throwable, scored: scoreWeapon(slots.throwable, { ...ctx, slotType: 'throwable' }) })
  if (slots.armor)     items.push({ item: slots.armor,     scored: scoreArmor(slots.armor, ctx) })
  if (slots.booster)   items.push({ item: slots.booster,   scored: scoreBooster(slots.booster, ctx) })
  for (const s of (slots.stratagems ?? [])) {
    if (s) items.push({ item: s, scored: scoreStratagem(s, { ...ctx, slotType: 'stratagem' }) })
  }

  if (items.length < 3) return null

  const overall = Math.round(items.reduce((sum, i) => sum + i.scored.total, 0) / items.length)
  const dimKeys = ['faction', 'planet', 'mission', 'playstyle', 'loadout']
  const dimensions = {}
  for (const k of dimKeys) {
    dimensions[k] = Math.round(items.reduce((sum, i) => sum + (i.scored.dimensions[k] ?? 0), 0) / items.length)
  }

  return { overall, dimensions, perItem: items }
}

// ── Main export ───────────────────────────────────────────────────────────────
export { DIFFICULTY_LABELS }

export function suggestLoadout({
  weapons,
  armor,
  stratagems,
  boosters,
  factions              = [],
  enemies               = [],
  conditions            = [],
  mission               = null,
  playstyle             = null,
  difficulty            = 5,
  stratagemLimits       = {},
  stratagemLimitsEnabled = false,
  buildAround           = null,
  currentSlots          = {},
  synergyModes          = { planet: true, loadout: true, faction: true, playstyle: true, mission: true },
  ownedWarbonds         = null,
  warbondFilterMode     = 'all',
  excludeIds            = null,
}) {
  const ctx = { enemies, factions, conditions, mission, playstyle, difficulty, synergyModes, buildAround, currentSlots }

  function filterOwned(items) {
    let filtered = items
    if (excludeIds?.size) filtered = filtered.filter(i => !excludeIds.has(i.id))
    if (warbondFilterMode === 'owned' && ownedWarbonds) {
      filtered = filtered.filter(i => !i.warbond || ownedWarbonds.has(i.warbond))
    }
    return filtered
  }

  // For 'prefer' mode: apply -15 penalty to unowned items after scoring
  function applyWarbondPreference(scored) {
    if (warbondFilterMode !== 'prefer' || !ownedWarbonds) return scored
    return scored.map(e => {
      if (e.item.warbond && !ownedWarbonds.has(e.item.warbond)) {
        return { ...e, score: Math.max(0, e.score - 15), total: Math.max(0, (e.total ?? e.score) - 15) }
      }
      return e
    }).sort((a, b) => (b.total ?? b.score) - (a.total ?? a.score))
  }

  function scoreAndRank(items, scorer) {
    const ranked = items
      .map(item => {
        const result = scorer(item)
        return { item, score: result.total, total: result.total, dimensions: result.dimensions }
      })
      .sort((a, b) => b.score - a.score)
      .map(e => ({ ...e, rationale: buildRationale(e.item, e.score, ctx) }))
    return applyWarbondPreference(ranked)
  }

  const rankedPrimaries   = scoreAndRank(filterOwned(weapons.primaries   ?? []), w => scoreWeapon(w, { ...ctx, slotType: 'primary' }))
  const rankedSecondaries = scoreAndRank(filterOwned(weapons.secondaries ?? []), w => scoreWeapon(w, { ...ctx, slotType: 'secondary' }))
  const rankedThrowables  = scoreAndRank(filterOwned(weapons.throwables  ?? []), w => scoreWeapon(w, { ...ctx, slotType: 'throwable' }))
  const rankedArmor       = scoreAndRank(filterOwned(armor),   a => scoreArmor(a, ctx))
  const rankedBoosters    = scoreAndRank(filterOwned(boosters), b => scoreBooster(b, ctx))

  const rankedStratagemsAll = scoreAndRank(
    filterOwned(stratagems),
    s => scoreStratagem(s, { ...ctx, slotType: 'stratagem' })
  )

  // AUTO: pure synergy ranking — top 4 by score, no category constraints
  // MANUAL: enforce per-category limits with combined budget of 4
  let pickedStratagems = []
  if (!stratagemLimitsEnabled) {
    pickedStratagems = rankedStratagemsAll.slice(0, 4)
  } else {
    const limits = { Orbital:1, Eagle:1, 'Support Weapon':1, Backpack:1, Sentry:0, Vehicle:0, Emplacement:0, ...stratagemLimits }
    const categoryCounts = {}
    for (const entry of rankedStratagemsAll) {
      if (pickedStratagems.length >= 4) break
      const cat  = entry.item.category
      const maxC = limits[cat] ?? 4
      if (maxC === 0) continue
      const count = categoryCounts[cat] ?? 0
      if (count >= maxC) continue
      pickedStratagems.push(entry)
      categoryCounts[cat] = count + 1
    }
    // Pad if limits were too restrictive
    if (pickedStratagems.length < 4) {
      const picked = new Set(pickedStratagems.map(e => e.item.id))
      for (const entry of rankedStratagemsAll) {
        if (pickedStratagems.length >= 4) break
        if (!picked.has(entry.item.id)) pickedStratagems.push(entry)
      }
    }
  }

  function applyBuildAround(slotType, ranked) {
    if (!buildAround || buildAround.slotType !== slotType) return ranked[0] ?? null
    let s
    if (slotType === 'armor')     s = scoreArmor(buildAround.item, ctx)
    else if (slotType === 'stratagem') s = scoreStratagem(buildAround.item, ctx)
    else s = scoreWeapon(buildAround.item, { ...ctx, slotType })
    return { item: buildAround.item, score: s.total, total: s.total, dimensions: s.dimensions, rationale: ['◉ Build-around anchor — loadout optimized around this item'], locked: true }
  }

  const finalStratagems = buildAround?.slotType === 'stratagem'
    ? (() => {
        const s = scoreStratagem(buildAround.item, ctx)
        const locked = { item: buildAround.item, score: s.total, total: s.total, dimensions: s.dimensions, rationale: ['◉ Build-around anchor'], locked: true }
        return [locked, ...pickedStratagems.filter(e => e.item.id !== buildAround.item.id).slice(0, 3)]
      })()
    : pickedStratagems

  function alts(ranked, topId, n = 3) {
    return ranked.filter(e => e.item.id !== topId).slice(0, n)
  }

  const topPrimary   = applyBuildAround('primary',   rankedPrimaries)
  const topSecondary = applyBuildAround('secondary', rankedSecondaries)
  const topThrowable = applyBuildAround('throwable', rankedThrowables)
  const topArmor     = applyBuildAround('armor',     rankedArmor)
  const topBooster   = rankedBoosters[0] ?? null

  return {
    primary:    topPrimary,
    secondary:  topSecondary,
    throwable:  topThrowable,
    armor:      topArmor,
    stratagems: finalStratagems,
    booster:    topBooster,
    alternatives: {
      primary:   alts(rankedPrimaries,   topPrimary?.item?.id),
      secondary: alts(rankedSecondaries, topSecondary?.item?.id),
      throwable: alts(rankedThrowables,  topThrowable?.item?.id),
      armor:     alts(rankedArmor,       topArmor?.item?.id),
      booster:   alts(rankedBoosters,    topBooster?.item?.id),
    },
    context: { factionIds: factions.map(f => f.id), enemyIds: enemies.map(e => e.id), conditions, mission, playstyleId: playstyle?.id ?? null, synergyModes, difficulty },
  }
}
