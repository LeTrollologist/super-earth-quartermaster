/**
 * Squad-level suggestion algorithm.
 * Auto-assigns roles based on context, generates 4 loadouts with support weapon deduplication.
 */
import { suggestLoadout } from './suggestions'
import playstylesData from '../data/playstyles.json'

const ROLE_COLORS = {
  'tank-buster':   '#ef4444',
  'chaff-clear':   '#f97316',
  'support-medic': '#22c55e',
  'engineer':      '#3b82f6',
  'lone-wolf':     '#a78bfa',
  'flex':          '#6b7280',
  'bug-diver':     '#e67e22',
  'bot-diver':     '#c0392b',
  'mech-pilot':    '#8b5cf6',
  'sample-goblin': '#eab308',
}

export { ROLE_COLORS }

function assignRoles(enemies, factions, difficulty) {
  const factionIds = factions.map(f => f.id ?? f)
  const heavyCount = (enemies ?? []).filter(e => (e.armorTier ?? 1) >= 4).length
  const lightCount = (enemies ?? []).filter(e => (e.armorTier ?? 1) <= 2).length
  const isHighDiff = (difficulty ?? 5) >= 7

  const roles = []

  // AT needs
  if (heavyCount >= 2 || factionIds.includes('automatons')) {
    roles.push('tank-buster')
    if (heavyCount >= 3 || isHighDiff) roles.push('tank-buster')
  } else if (heavyCount >= 1) {
    roles.push('tank-buster')
  }

  // Crowd control needs
  if (lightCount >= 2 || factionIds.includes('terminids')) {
    if (roles.length < 3) roles.push('chaff-clear')
    if (lightCount >= 3 && roles.length < 3) roles.push('chaff-clear')
  }

  // Always at least one support
  if (roles.length < 4 && !roles.includes('support-medic')) {
    roles.push('support-medic')
  }

  // Fill remaining with flex or context-appropriate
  while (roles.length < 4) {
    if (factionIds.includes('terminids') && !roles.includes('chaff-clear')) {
      roles.push('chaff-clear')
    } else if (factionIds.includes('automatons') && roles.filter(r => r === 'tank-buster').length < 2) {
      roles.push('tank-buster')
    } else {
      roles.push('flex')
    }
  }

  return roles.slice(0, 4)
}

function calculateSquadSynergy(members) {
  const checks = {
    antiTank:     { count: 0, target: 1, pass: false },
    crowdControl: { count: 0, target: 1, pass: false },
    support:      { count: 0, target: 1, pass: false },
    diversity:    { score: 100, pass: true },
    damageTypes:  { count: 0, target: 3, pass: false },
  }

  const supportWeaponIds = []
  const damageTypes = new Set()

  for (const m of members) {
    const loadout = m.loadout
    if (!loadout) continue

    // Check stratagems
    const strats = loadout.stratagems ?? []
    for (const s of strats) {
      if (!s?.item) continue
      const tags = s.item.tags ?? []
      if (tags.includes('Anti-Tank'))   checks.antiTank.count++
      if (tags.includes('Area Denial')) checks.crowdControl.count++
      if (tags.some(t => ['Shield','Supply','Medical','Reinforce'].includes(t))) checks.support.count++
      if (s.item.category === 'Support Weapon') supportWeaponIds.push(s.item.id)
    }

    // Collect damage types
    if (loadout.primary?.item?.damageType)   damageTypes.add(loadout.primary.item.damageType)
    if (loadout.secondary?.item?.damageType) damageTypes.add(loadout.secondary.item.damageType)
    for (const s of strats) {
      if (s?.item?.damageType) damageTypes.add(s.item.damageType)
    }
  }

  checks.antiTank.pass     = checks.antiTank.count >= checks.antiTank.target
  checks.crowdControl.pass = checks.crowdControl.count >= checks.crowdControl.target
  checks.support.pass      = checks.support.count >= checks.support.target
  checks.damageTypes.count = damageTypes.size
  checks.damageTypes.pass  = damageTypes.size >= checks.damageTypes.target

  // Duplicate support weapon penalty
  const uniqueSW = new Set(supportWeaponIds)
  const dupes = supportWeaponIds.length - uniqueSW.size
  checks.diversity.score = Math.max(0, 100 - dupes * 25)
  checks.diversity.pass  = dupes === 0

  // Overall score
  const passCount = [checks.antiTank, checks.crowdControl, checks.support, checks.diversity, checks.damageTypes]
    .filter(c => c.pass).length
  const squadScore = Math.round((passCount / 5) * 80 + (checks.diversity.score / 100) * 20)

  return { squadScore, checks }
}

export function suggestSquadLoadout({
  weapons, armor, stratagems, boosters,
  factions = [], enemies = [], conditions = [], mission = null,
  difficulty = 5, synergyModes, stratagemLimits, stratagemLimitsEnabled,
  ownedWarbonds, warbondFilterMode, allowDuplicateSupportWeapons = false,
}) {
  const roles = assignRoles(enemies, factions, difficulty)
  const excludeIds = new Set()
  const memberResults = []

  for (let i = 0; i < 4; i++) {
    const role = roles[i]
    const playstyle = playstylesData.find(p => p.id === role) ?? playstylesData.find(p => p.id === 'flex') ?? null

    const result = suggestLoadout({
      weapons, armor, stratagems, boosters,
      factions, enemies, conditions, mission, difficulty,
      playstyle, synergyModes, stratagemLimits, stratagemLimitsEnabled,
      ownedWarbonds, warbondFilterMode,
      buildAround: null,
      currentSlots: {},
      excludeIds: allowDuplicateSupportWeapons ? null : excludeIds,
    })

    // Exclude this member's support weapon from future members
    if (!allowDuplicateSupportWeapons) {
      const strats = result.stratagems ?? []
      for (const s of strats) {
        if (s?.item?.category === 'Support Weapon') excludeIds.add(s.item.id)
      }
    }

    memberResults.push({
      role,
      playstyleId: playstyle?.id ?? 'flex',
      playstyleName: playstyle?.name ?? 'Flex',
      loadout: result,
      memberScore: Math.round(
        ([result.primary, result.secondary, result.throwable, result.armor, result.booster, ...(result.stratagems ?? [])]
          .filter(Boolean)
          .reduce((sum, s) => sum + (s.total ?? s.score ?? 50), 0)
        ) / 8
      ),
    })
  }

  const { squadScore, checks } = calculateSquadSynergy(memberResults)

  return {
    members: memberResults,
    squadScore,
    coverageChecks: checks,
    roles,
  }
}
