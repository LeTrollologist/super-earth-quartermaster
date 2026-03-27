import { create } from 'zustand'

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
  selectedFactions: [],       // ['terminids', 'automatons', 'illuminate']
  selectedEnemies:  [],       // enemy ids
  selectedConditions: [],     // planet condition ids
  activePlanet: null,         // live war planet data

  // --- Slot actions ---
  setSlot: (slotKey, item) => set(state => {
    if (slotKey === 'stratagem') {
      const idx = state.activeStratagemIndex
      const updated = [...state.slots.stratagems]
      // If item is already in another slot, remove it
      const existingIdx = updated.findIndex(s => s?.id === item?.id)
      if (existingIdx !== -1 && existingIdx !== idx) updated[existingIdx] = null
      updated[idx] = item
      return { slots: { ...state.slots, stratagems: updated } }
    }
    return { slots: { ...state.slots, [slotKey]: item } }
  }),

  setStratagemSlot: (index, item) => set(state => {
    const updated = [...state.slots.stratagems]
    // Remove duplicates
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
  setHovered: (item) => set({ hoveredItem: item }),
  clearHovered: () => set({ hoveredItem: null }),

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
  toggleFaction: (factionId) => set(state => {
    const has = state.selectedFactions.includes(factionId)
    return {
      selectedFactions: has
        ? state.selectedFactions.filter(f => f !== factionId)
        : [...state.selectedFactions, factionId],
    }
  }),
  toggleEnemy: (enemyId) => set(state => {
    const has = state.selectedEnemies.includes(enemyId)
    return {
      selectedEnemies: has
        ? state.selectedEnemies.filter(e => e !== enemyId)
        : [...state.selectedEnemies, enemyId],
    }
  }),
  toggleCondition: (condId) => set(state => {
    const has = state.selectedConditions.includes(condId)
    return {
      selectedConditions: has
        ? state.selectedConditions.filter(c => c !== condId)
        : [...state.selectedConditions, condId],
    }
  }),
  setActivePlanet: (planet) => set({ activePlanet: planet }),
}))
