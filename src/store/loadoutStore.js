import { create } from 'zustand'
import { WARBOND_ORDER } from '../constants/warbonds'

export const useLoadoutStore = create((set, get) => ({
  // Loadout slots
  slots: {
    primary:    null,
    secondary:  null,
    throwable:  null,
    armor:      null,
    stratagems: [null, null, null, null],
    booster:    null,
  },

  // UI state
  activeSlot:   'primary',
  activeStratagemIndex: 0,
  hoveredItem:  null,
  compareMode:  false,
  compareItems: [null, null],

  // Faction & planet filters for recommendations
  selectedFactions:   [],    // ['terminids', 'automatons', 'illuminate']
  selectedEnemies:    [],    // enemy ids
  selectedConditions: [],    // planet condition ids
  activePlanet:       null,  // live war planet data

  // ── Suggestion engine settings ───────────────────────────────────────────
  // Stratagem category limits — only active when stratagemLimitsEnabled is true
  // Default sums to 4 (one balanced slot per category) for a sensible starting point
  stratagemLimits: {
    Orbital:          1,
    Eagle:            1,
    'Support Weapon': 1,
    Backpack:         1,
    Sentry:           0,
    Vehicle:          0,
    Emplacement:      0,
  },
  stratagemLimitsEnabled: false,  // false = AUTO (pure synergy, top 4); true = MANUAL (respect limits)

  // Build-Around: lock a specific item and build the rest around it
  buildAroundItem: null,   // { item, slotType } | null

  // Selected playstyle
  selectedPlaystyle: null,  // playstyle id or null

  // Active synergy modes (each toggles how much that factor weighs in scoring)
  synergyModes: {
    planet:    true,   // prioritize items that work well with selected conditions
    loadout:   true,   // prioritize items that complement each other (fill gaps)
    faction:   true,   // prioritize items effective vs selected factions/enemies
    playstyle: true,   // prioritize items matching selected playstyle
    mission:   true,   // prioritize items suited to selected mission type
  },

  // Active mission for suggestions
  suggestMission: null,    // mission id

  // Owned warbonds (for filtering suggestions to only owned items)
  ownedWarbonds: new Set(WARBOND_ORDER), // all owned by default

  // --- Slot actions ---
  setSlot: (slotKey, item) => set(state => {
    if (slotKey === 'stratagem') {
      const idx = state.activeStratagemIndex
      const updated = [...state.slots.stratagems]
      const existingIdx = updated.findIndex(s => s?.id === item?.id)
      if (existingIdx !== -1 && existingIdx !== idx) updated[existingIdx] = null
      updated[idx] = item
      return { slots: { ...state.slots, stratagems: updated } }
    }
    return { slots: { ...state.slots, [slotKey]: item } }
  }),

  setStratagemSlot: (index, item) => set(state => {
    const updated = [...state.slots.stratagems]
    const existingIdx = updated.findIndex(s => s?.id === item?.id)
    if (existingIdx !== -1 && existingIdx !== index) updated[existingIdx] = null
    updated[index] = item
    return {
      slots: { ...state.slots, stratagems: updated },
      activeStratagemIndex: index,
    }
  }),

  clearSlot: (slotKey, index = null) => set(state => {
    if (slotKey === 'stratagem' && index !== null) {
      const updated = [...state.slots.stratagems]
      updated[index] = null
      return { slots: { ...state.slots, stratagems: updated } }
    }
    return { slots: { ...state.slots, [slotKey]: null } }
  }),

  clearLoadout: () => set({
    slots: {
      primary:    null,
      secondary:  null,
      throwable:  null,
      armor:      null,
      stratagems: [null, null, null, null],
      booster:    null,
    }
  }),

  // --- Active slot ---
  setActiveSlot: (slotKey, stratagemIndex = 0) => set({
    activeSlot: slotKey,
    activeStratagemIndex: slotKey === 'stratagem' ? stratagemIndex : 0,
  }),

  // --- Hover preview ---
  setHovered:   (item) => set({ hoveredItem: item }),
  clearHovered: ()     => set({ hoveredItem: null }),

  // --- Compare mode ---
  toggleCompare: () => set(state => ({
    compareMode: !state.compareMode,
    compareItems: [null, null],
  })),
  setCompareItem: (index, item) => set(state => {
    const updated = [...state.compareItems]
    updated[index] = item
    return { compareItems: updated }
  }),
  clearCompare: () => set({ compareItems: [null, null] }),

  // --- Faction / enemy / planet ---
  toggleFaction: (factionId) => set(state => ({
    selectedFactions: state.selectedFactions.includes(factionId)
      ? state.selectedFactions.filter(f => f !== factionId)
      : [...state.selectedFactions, factionId],
  })),
  toggleEnemy: (enemyId) => set(state => ({
    selectedEnemies: state.selectedEnemies.includes(enemyId)
      ? state.selectedEnemies.filter(e => e !== enemyId)
      : [...state.selectedEnemies, enemyId],
  })),
  toggleCondition: (condId) => set(state => ({
    selectedConditions: state.selectedConditions.includes(condId)
      ? state.selectedConditions.filter(c => c !== condId)
      : [...state.selectedConditions, condId],
  })),
  setActivePlanet: (planet) => set({ activePlanet: planet }),

  // --- Suggestion settings ---
  setStratagemLimit: (category, max) => set(state => ({
    stratagemLimits: { ...state.stratagemLimits, [category]: max },
  })),
  toggleStratagemLimits: () => set(state => ({ stratagemLimitsEnabled: !state.stratagemLimitsEnabled })),

  setBuildAroundItem: (item, slotType) => set({ buildAroundItem: { item, slotType } }),
  clearBuildAround:  ()                => set({ buildAroundItem: null }),

  setSelectedPlaystyle: (id) => set({ selectedPlaystyle: id }),

  toggleSynergyMode: (mode) => set(state => ({
    synergyModes: { ...state.synergyModes, [mode]: !state.synergyModes[mode] },
  })),

  setSuggestMission: (missionId) => set({ suggestMission: missionId }),

  toggleOwnedWarbond: (warbond) => set(state => {
    const next = new Set(state.ownedWarbonds)
    if (next.has(warbond)) next.delete(warbond)
    else next.add(warbond)
    return { ownedWarbonds: next }
  }),
  setAllWarbondsOwned: () => set({ ownedWarbonds: new Set(WARBOND_ORDER) }),
}))
