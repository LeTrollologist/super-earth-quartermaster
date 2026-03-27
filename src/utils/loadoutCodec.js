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
