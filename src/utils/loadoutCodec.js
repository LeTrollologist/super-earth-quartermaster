/**
 * Encode a loadout object to a URL-safe base64 string.
 */
export function encodeLoadout(slots) {
  const compact = {
    p:  slots.primary?.id    ?? null,
    s:  slots.secondary?.id  ?? null,
    t:  slots.throwable?.id  ?? null,
    a:  slots.armor?.id      ?? null,
    st: slots.stratagems.map(s => s?.id ?? null),
    b:  slots.booster?.id    ?? null,
  }
  try {
    return btoa(unescape(encodeURIComponent(JSON.stringify(compact))))
  } catch {
    return null
  }
}

/**
 * Export a loadout as a human-readable JSON object.
 */
export function exportLoadoutJSON(slots) {
  return {
    version: 1,
    primary:    slots.primary?.id    ?? null,
    secondary:  slots.secondary?.id  ?? null,
    throwable:  slots.throwable?.id  ?? null,
    armor:      slots.armor?.id      ?? null,
    stratagems: slots.stratagems.map(s => s?.id ?? null),
    booster:    slots.booster?.id    ?? null,
  }
}

/**
 * Import a loadout from a JSON object and resolve items from data arrays.
 */
export function importLoadoutJSON(json, { weapons, armor, stratagems, boosters }) {
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    const find = (arr, id) => arr?.find(i => i.id === id) ?? null
    return {
      primary:    find(weapons?.primaries,   data.primary),
      secondary:  find(weapons?.secondaries, data.secondary),
      throwable:  find(weapons?.throwables,  data.throwable),
      armor:      find(armor,                data.armor),
      stratagems: (data.stratagems ?? [null,null,null,null]).map(id => find(stratagems, id)),
      booster:    find(boosters, data.booster),
    }
  } catch {
    return null
  }
}

/**
 * Decode a base64 loadout string and resolve items from data arrays.
 */
export function decodeLoadout(encoded, { weapons, armor, stratagems, boosters }) {
  try {
    const str = decodeURIComponent(escape(atob(encoded)))
    const compact = JSON.parse(str)

    const allWeapons = [
      ...(weapons?.primaries   ?? []),
      ...(weapons?.secondaries ?? []),
      ...(weapons?.throwables  ?? []),
    ]
    const find = (arr, id) => arr?.find(i => i.id === id) ?? null

    return {
      primary:    find(weapons?.primaries,   compact.p),
      secondary:  find(weapons?.secondaries, compact.s),
      throwable:  find(weapons?.throwables,  compact.t),
      armor:      find(armor,                compact.a),
      stratagems: (compact.st ?? [null,null,null,null]).map(id => find(stratagems, id)),
      booster:    find(boosters, compact.b),
    }
  } catch {
    return null
  }
}
