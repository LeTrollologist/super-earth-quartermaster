/**
 * Super Earth Quartermaster — Suggestion Engine v2
 * Supports: faction, enemy, condition, mission, playstyle, loadout synergy, build-around
 */

// ── AP penetration helper ─────────────────────────────────────────────────────
function canPenetrate(weaponAP, enemyAP) {
  if (weaponAP === undefined || weaponAP === null) return true
  return weaponAP >= enemyAP
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
  for (const fid of factionIds) {
    const fTags = FACTION_TAGS[fid] ?? []
    for (const t of fTags) {
      if (tags.includes(t)) hits++
    }
  }
  return Math.min(hits * 15, 45)
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

function conditionPassiveBonus(passive, conditions) {
  if (!passive || !conditions?.length) return 0
  let bonus = 0
  for (const cond of conditions) {
    if (CONDITION_PASSIVE_BONUS[cond]?.includes(passive)) bonus += 20
  }
  return Math.min(bonus, 40)
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

// ── Synergy stacking bonus ────────────────────────────────────────────────────
// Rewards items that score positively across multiple active synergy dimensions.
// Each dimension beyond 2 that contributes positively adds +8 to the final score.
function synergyStackBonus(contribs, synergyModes) {
  if (!synergyModes) return 0
  const activeModes = Object.values(synergyModes).filter(Boolean).length
  if (activeModes < 2) return 0
  const positiveCount = contribs.filter(c => c > 0).length
  if (positiveCount < 3) return 0
  return (positiveCount - 2) * 8
}

// ── Item scorers ──────────────────────────────────────────────────────────────
function scoreWeapon(weapon, ctx) {
  const { enemies, factions, conditions, mission, playstyle, synergyModes, buildAround, currentSlots, slotType } = ctx
  let score = 50
  let factionC = 0, missionC = 0, playstyleC = 0, loadoutC = 0

  if (synergyModes?.faction !== false && (enemies.length || factions.length)) {
    const penetrates = !enemies.length || enemies.every(e => canPenetrate(weapon.apTier, e.armorTier ?? 1))
    if (!penetrates) factionC -= 30
    else if (enemies.length && (weapon.apTier ?? 0) > Math.max(...enemies.map(e => e.armorTier ?? 1))) factionC += 10
    factionC += factionTagOverlap(weapon.traits ?? [], factions.map(f => f.id))
    if (factions.some(f => f.id === 'terminids') && weapon.damageType === 'Fire')       factionC += 15
    if (factions.some(f => f.id === 'automatons') && weapon.damageType === 'Explosive') factionC += 10
    if (factions.some(f => f.id === 'illuminate') && weapon.damageType === 'Arc')       factionC += 15
    score += factionC
  }

  if (synergyModes?.mission !== false && mission) {
    const mw = MISSION_WEIGHTS[mission]
    if (mw) {
      const traits = weapon.traits ?? []
      if (traits.some(t => ['Area','DoT','Explosive'].includes(t)) || (weapon.fireRate ?? 0) >= 600) missionC += mw.area
      if (traits.some(t => ['Anti-Light','High Stagger','Fire'].includes(t))) missionC += mw.antiLight
      if ((weapon.apTier ?? 0) >= 4 || traits.some(t => ['Anti-Heavy','Anti-Tank'].includes(t))) missionC += mw.antiHeavy
    }
    if (['blitz','retrieve-essential-personnel'].includes(mission) && (weapon.fireRate ?? 0) >= 600) missionC += 5
    score += missionC
  }

  if (synergyModes?.playstyle !== false && playstyle) {
    playstyleC = playstyleWeaponBonus(weapon, playstyle)
    score += playstyleC
  }

  if (synergyModes?.loadout !== false) {
    loadoutC = loadoutSynergyBonus(weapon, slotType, buildAround, currentSlots)
    score += loadoutC
  }

  score += synergyStackBonus([factionC, missionC, playstyleC, loadoutC], synergyModes)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

function scoreArmor(armor, ctx) {
  const { conditions, factions, mission, playstyle, synergyModes, buildAround, currentSlots } = ctx
  let score = 50
  let planetC = 0, factionC = 0, missionC = 0, playstyleC = 0, loadoutC = 0

  if (synergyModes?.planet !== false) {
    planetC = conditionPassiveBonus(armor.passive, conditions)
    score += planetC
  }

  if (synergyModes?.faction !== false && factions.length) {
    if (factions.some(f => f.id === 'terminids')  && armor.passive === 'Inflammable')        factionC += 10
    if (factions.some(f => f.id === 'automatons') && armor.passive === 'Fortified')          factionC += 10
    if (factions.some(f => f.id === 'illuminate') && armor.passive === 'Electrical Conduit') factionC += 10
    if (factions.some(f => f.id === 'automatons') && ['Servo-Assisted','Unflinching'].includes(armor.passive)) factionC += 8
    score += factionC
  }

  if (synergyModes?.mission !== false && mission) {
    const mw = MISSION_WEIGHTS[mission]
    if (mw?.armorType) missionC += mw.armorType[armor.type] ?? 0
    if (['blitz','retrieve-essential-personnel'].includes(mission) && armor.type === 'Light') missionC += 15
    if (['defend','activate-tcs'].includes(mission) && armor.type === 'Heavy') missionC += 10
    if (mission === 'eradicate' && armor.passive === 'Engineering Kit') missionC += 10
    score += missionC
  }

  if (synergyModes?.playstyle !== false && playstyle) {
    playstyleC = playstyleArmorBonus(armor, playstyle)
    score += playstyleC
  }

  if (synergyModes?.loadout !== false) {
    loadoutC = loadoutSynergyBonus(armor, 'armor', buildAround, currentSlots)
    score += loadoutC
  }

  score += synergyStackBonus([planetC, factionC, missionC, playstyleC, loadoutC], synergyModes)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

function scoreStratagem(stratagem, ctx) {
  const { enemies, factions, conditions, mission, playstyle, synergyModes, buildAround, currentSlots } = ctx
  let score = 50
  const tags = stratagem.tags ?? []
  let factionC = 0, planetC = 0, missionC = 0, playstyleC = 0, loadoutC = 0

  if (synergyModes?.faction !== false) {
    factionC += factionTagOverlap(tags, factions.map(f => f.id))
    if (enemies.length) {
      const maxAP = Math.max(...enemies.map(e => e.armorTier ?? 1))
      if (maxAP >= 4 && tags.includes('Anti-Tank'))  factionC += 20
      if (maxAP >= 3 && tags.includes('Anti-Heavy')) factionC += 10
      if (maxAP <= 2 && tags.includes('Anti-Light')) factionC += 15
    }
    score += factionC
  }

  if (synergyModes?.planet !== false && conditions.length) {
    if (conditions.includes('ion_storms') && stratagem.cooldown > 300) planetC -= 10
    if (conditions.includes('stalker_infestation') && tags.some(t => ['Anti-Light','Automatic'].includes(t))) planetC += 15
    score += planetC
  }

  if (synergyModes?.mission !== false && mission) {
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
    score += missionC
  }

  if (synergyModes?.playstyle !== false && playstyle) {
    playstyleC = playstyleStratagemBonus(stratagem, playstyle)
    score += playstyleC
  }

  if (synergyModes?.loadout !== false) {
    loadoutC = loadoutSynergyBonus(stratagem, 'stratagem', buildAround, currentSlots)
    score += loadoutC
  }

  score += synergyStackBonus([factionC, planetC, missionC, playstyleC, loadoutC], synergyModes)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

function scoreBooster(booster, ctx) {
  const { mission, conditions, playstyle, synergyModes } = ctx
  let score = 50
  const eff = (booster.effect ?? booster.description ?? '').toLowerCase()
  let missionC = 0, planetC = 0, playstyleC = 0

  if (synergyModes?.mission !== false && mission) {
    if (mission === 'blitz' && (eff.includes('stamina') || eff.includes('sprint'))) missionC += 20
    if (mission === 'retrieve-essential-personnel' && eff.includes('extraction')) missionC += 25
    if (mission === 'eradicate' && eff.includes('reinforce')) missionC += 15
    if (mission === 'defend' && (eff.includes('hp') || eff.includes('vitality'))) missionC += 10
    score += missionC
  }

  if (synergyModes?.planet !== false && conditions.length) {
    if (conditions.includes('extreme_cold') && eff.includes('stamina')) planetC += 15
    if (conditions.includes('toxic_haze') && eff.includes('hp')) planetC += 10
    if (conditions.includes('spore_clouds') && eff.includes('stamina')) planetC += 10
    score += planetC
  }

  if (synergyModes?.playstyle !== false && playstyle) {
    if (playstyle.id === 'lone-wolf' && eff.includes('stamina')) playstyleC += 10
    if (playstyle.id === 'support-medic' && eff.includes('hp')) playstyleC += 15
    if (playstyle.id === 'sample-goblin' && eff.includes('stamina')) playstyleC += 15
    score += playstyleC
  }

  score += synergyStackBonus([missionC, planetC, playstyleC], synergyModes)

  return Math.min(Math.max(Math.round(score), 0), 100)
}

// ── Rationale builder ─────────────────────────────────────────────────────────
function buildRationale(item, score, ctx) {
  const reasons = []
  const { factions, enemies, conditions, mission, playstyle, buildAround } = ctx

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
  }

  if (reasons.length === 0) {
    if (score >= 70) reasons.push('Strong all-round choice for current context')
    else if (score >= 50) reasons.push('Solid performer for this loadout')
    else reasons.push('Viable — check alternatives for better fit')
  }

  return reasons
}

// ── Main export ───────────────────────────────────────────────────────────────
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
  stratagemLimits       = {},
  stratagemLimitsEnabled = false,
  buildAround           = null,
  currentSlots          = {},
  synergyModes          = { planet: true, loadout: true, faction: true, playstyle: true, mission: true },
  ownedWarbonds         = null,
}) {
  const ctx = { enemies, factions, conditions, mission, playstyle, synergyModes, buildAround, currentSlots }

  function filterOwned(items) {
    if (!ownedWarbonds) return items
    return items.filter(i => !i.warbond || ownedWarbonds.has(i.warbond))
  }

  function scoreAndRank(items, scorer) {
    return items
      .map(item => ({ item, score: scorer(item) }))
      .sort((a, b) => b.score - a.score)
      .map(e => ({ ...e, rationale: buildRationale(e.item, e.score, ctx) }))
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
    return { item: buildAround.item, score: s, rationale: ['◉ Build-around anchor — loadout optimized around this item'], locked: true }
  }

  const finalStratagems = buildAround?.slotType === 'stratagem'
    ? (() => {
        const locked = { item: buildAround.item, score: scoreStratagem(buildAround.item, ctx), rationale: ['◉ Build-around anchor'], locked: true }
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
    context: { factionIds: factions.map(f => f.id), enemyIds: enemies.map(e => e.id), conditions, mission, playstyleId: playstyle?.id ?? null, synergyModes },
  }
}
