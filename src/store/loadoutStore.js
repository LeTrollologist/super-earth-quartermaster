import { create } from 'zustand'
import { WARBOND_ORDER } from '../constants/warbonds'

const EMPTY_SLOTS = () => ({
  primary:    null,
  secondary:  null,
  throwable:  null,
  armor:      null,
  stratagems: [null, null, null, null],
  booster:    null,
})

function loadPresets() {
  try { return JSON.parse(localStorage.getItem('sq-presets') || '[]') }
  catch { return [] }
}
function persistPresets(presets) {
  try { localStorage.setItem('sq-presets', JSON.stringify(presets)) } catch {}
}

function loadContext() {
  try {
    const raw = localStorage.getItem('sq-context')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function persistContext(state) {
  try {
    localStorage.setItem('sq-context', JSON.stringify({
      selectedFactions:   state.selectedFactions,
      selectedEnemies:    state.selectedEnemies,
      selectedConditions: state.selectedConditions,
      selectedPlaystyle:  state.selectedPlaystyle,
      suggestMission:     state.suggestMission,
      difficulty:         state.difficulty,
      warbondFilterMode:  state.warbondFilterMode,
      autoEnemySelection: state.autoEnemySelection,
    }))
  } catch {}
}

const savedContext = loadContext()

export const useLoadoutStore = create((set, get) => ({
  // Loadout slots (solo mode)
  slots: EMPTY_SLOTS(),

  // UI state
  activeSlot:   'primary',
  activeStratagemIndex: 0,
  hoveredItem:  null,
  compareMode:  false,
  compareItems: [null, null],

  // Faction & planet filters for recommendations (restored from localStorage)
  selectedFactions:   savedContext?.selectedFactions   ?? [],
  selectedEnemies:    savedContext?.selectedEnemies    ?? [],
  selectedConditions: savedContext?.selectedConditions ?? [],
  activePlanet:       null,
  autoEnemySelection: savedContext?.autoEnemySelection ?? (!(savedContext?.selectedEnemies?.length > 0)),

  // ── Suggestion engine settings ───────────────────────────────────────────
  stratagemLimits: {
    Orbital:          1,
    Eagle:            1,
    'Support Weapon': 1,
    Backpack:         1,
    Sentry:           0,
    Vehicle:          0,
    Emplacement:      0,
  },
  stratagemLimitsEnabled: false,

  buildAroundItem: null,
  selectedPlaystyle: savedContext?.selectedPlaystyle ?? null,

  synergyModes: {
    planet:    true,
    loadout:   true,
    faction:   true,
    playstyle: true,
    mission:   true,
  },

  suggestMission: savedContext?.suggestMission ?? null,
  difficulty: savedContext?.difficulty ?? 5,

  ownedWarbonds: new Set(WARBOND_ORDER),
  warbondFilterMode: savedContext?.warbondFilterMode ?? 'all', // 'all' | 'prefer' | 'owned'

  // ── Presets (localStorage) ─────────────────────────────────────────────
  presets: loadPresets(),

  // ── Squad mode ─────────────────────────────────────────────────────────
  squadMode: false,
  squadMembers: [
    { name: 'Helldiver 1', slots: EMPTY_SLOTS(), playstyle: null, role: 'flex' },
    { name: 'Helldiver 2', slots: EMPTY_SLOTS(), playstyle: null, role: 'flex' },
    { name: 'Helldiver 3', slots: EMPTY_SLOTS(), playstyle: null, role: 'flex' },
    { name: 'Helldiver 4', slots: EMPTY_SLOTS(), playstyle: null, role: 'flex' },
  ],
  activeSquadMember: 0,

  // ── Cheatsheet / UI toggles ────────────────────────────────────────────
  showCheatSheet: false,

  // ── Computed: get active slots (solo or squad) ─────────────────────────
  getActiveSlots: () => {
    const state = get()
    return state.squadMode ? state.squadMembers[state.activeSquadMember].slots : state.slots
  },

  // --- Slot actions (squad-aware) ---
  setSlot: (slotKey, item) => set(state => {
    if (state.squadMode) {
      const members = state.squadMembers.map((m, i) => {
        if (i !== state.activeSquadMember) return m
        const newSlots = { ...m.slots }
        if (slotKey === 'stratagem') {
          const idx = state.activeStratagemIndex
          const updated = [...newSlots.stratagems]
          const existingIdx = updated.findIndex(s => s?.id === item?.id)
          if (existingIdx !== -1 && existingIdx !== idx) updated[existingIdx] = null
          updated[idx] = item
          newSlots.stratagems = updated
        } else {
          newSlots[slotKey] = item
        }
        return { ...m, slots: newSlots }
      })
      return { squadMembers: members }
    }
    // Solo mode
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
    if (state.squadMode) {
      const members = state.squadMembers.map((m, i) => {
        if (i !== state.activeSquadMember) return m
        const updated = [...m.slots.stratagems]
        const existingIdx = updated.findIndex(s => s?.id === item?.id)
        if (existingIdx !== -1 && existingIdx !== index) updated[existingIdx] = null
        updated[index] = item
        return { ...m, slots: { ...m.slots, stratagems: updated } }
      })
      return { squadMembers: members, activeStratagemIndex: index }
    }
    const updated = [...state.slots.stratagems]
    const existingIdx = updated.findIndex(s => s?.id === item?.id)
    if (existingIdx !== -1 && existingIdx !== index) updated[existingIdx] = null
    updated[index] = item
    return { slots: { ...state.slots, stratagems: updated }, activeStratagemIndex: index }
  }),

  clearSlot: (slotKey, index = null) => set(state => {
    if (state.squadMode) {
      const members = state.squadMembers.map((m, i) => {
        if (i !== state.activeSquadMember) return m
        const newSlots = { ...m.slots }
        if (slotKey === 'stratagem' && index !== null) {
          const updated = [...newSlots.stratagems]
          updated[index] = null
          newSlots.stratagems = updated
        } else {
          newSlots[slotKey] = null
        }
        return { ...m, slots: newSlots }
      })
      return { squadMembers: members }
    }
    if (slotKey === 'stratagem' && index !== null) {
      const updated = [...state.slots.stratagems]
      updated[index] = null
      return { slots: { ...state.slots, stratagems: updated } }
    }
    return { slots: { ...state.slots, [slotKey]: null } }
  }),

  clearLoadout: () => set(state => {
    if (state.squadMode) {
      const members = state.squadMembers.map((m, i) =>
        i === state.activeSquadMember ? { ...m, slots: EMPTY_SLOTS() } : m
      )
      return { squadMembers: members }
    }
    return { slots: EMPTY_SLOTS() }
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
    autoEnemySelection: false,
  })),
  setSelectedEnemies: (ids) => set({ selectedEnemies: ids }),
  setAutoEnemySelection: (val) => set({ autoEnemySelection: val }),
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
  setDifficulty: (level) => set({ difficulty: level }),

  toggleOwnedWarbond: (warbond) => set(state => {
    const next = new Set(state.ownedWarbonds)
    if (next.has(warbond)) next.delete(warbond)
    else next.add(warbond)
    return { ownedWarbonds: next }
  }),
  setAllWarbondsOwned: () => set({ ownedWarbonds: new Set(WARBOND_ORDER) }),
  setWarbondFilterMode: (mode) => set({ warbondFilterMode: mode }),

  // --- Presets ---
  savePreset: (name) => set(state => {
    const preset = {
      name,
      slots: state.squadMode ? state.squadMembers[state.activeSquadMember].slots : state.slots,
      selectedFactions: state.selectedFactions,
      selectedEnemies: state.selectedEnemies,
      selectedConditions: state.selectedConditions,
      selectedPlaystyle: state.selectedPlaystyle,
      suggestMission: state.suggestMission,
      difficulty: state.difficulty,
    }
    const presets = [...state.presets, preset].slice(-5)
    persistPresets(presets)
    return { presets }
  }),
  loadPreset: (index) => set(state => {
    const preset = state.presets[index]
    if (!preset) return {}
    const updates = {
      selectedFactions: preset.selectedFactions ?? [],
      selectedEnemies: preset.selectedEnemies ?? [],
      selectedConditions: preset.selectedConditions ?? [],
      selectedPlaystyle: preset.selectedPlaystyle ?? null,
      suggestMission: preset.suggestMission ?? null,
      difficulty: preset.difficulty ?? 5,
    }
    if (state.squadMode) {
      const members = state.squadMembers.map((m, i) =>
        i === state.activeSquadMember ? { ...m, slots: preset.slots } : m
      )
      return { ...updates, squadMembers: members }
    }
    return { ...updates, slots: preset.slots }
  }),
  deletePreset: (index) => set(state => {
    const presets = state.presets.filter((_, i) => i !== index)
    persistPresets(presets)
    return { presets }
  }),
  renamePreset: (index, name) => set(state => {
    const presets = state.presets.map((p, i) => i === index ? { ...p, name } : p)
    persistPresets(presets)
    return { presets }
  }),

  // --- Random loadout ---
  randomizeLoadout: (weapons, armor, stratagems, boosters) => set(state => {
    const owned = state.ownedWarbonds
    const filter = items => items.filter(i => !i.warbond || owned.has(i.warbond))
    const pick = arr => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null

    const primaries = filter(weapons.primaries ?? [])
    const secondaries = filter(weapons.secondaries ?? [])
    const throwables = filter(weapons.throwables ?? [])
    const armors = filter(armor)
    const boosts = filter(boosters)
    const strats = filter(stratagems)

    // Pick 4 unique stratagems
    const shuffled = [...strats].sort(() => Math.random() - 0.5)
    const pickedStrats = shuffled.slice(0, 4)

    const newSlots = {
      primary: pick(primaries),
      secondary: pick(secondaries),
      throwable: pick(throwables),
      armor: pick(armors),
      stratagems: [pickedStrats[0] ?? null, pickedStrats[1] ?? null, pickedStrats[2] ?? null, pickedStrats[3] ?? null],
      booster: pick(boosts),
    }

    if (state.squadMode) {
      const members = state.squadMembers.map((m, i) =>
        i === state.activeSquadMember ? { ...m, slots: newSlots } : m
      )
      return { squadMembers: members }
    }
    return { slots: newSlots }
  }),

  // --- Squad mode ---
  toggleSquadMode: () => set(state => {
    if (!state.squadMode) {
      // Entering squad mode — copy solo loadout to member 0
      const members = state.squadMembers.map((m, i) =>
        i === 0 ? { ...m, slots: { ...state.slots, stratagems: [...state.slots.stratagems] } } : m
      )
      return { squadMode: true, squadMembers: members, activeSquadMember: 0 }
    }
    return { squadMode: false }
  }),
  setActiveSquadMember: (index) => set({ activeSquadMember: index }),
  setSquadMemberName: (idx, name) => set(state => ({
    squadMembers: state.squadMembers.map((m, i) => i === idx ? { ...m, name } : m)
  })),
  setSquadMemberRole: (idx, role) => set(state => ({
    squadMembers: state.squadMembers.map((m, i) => i === idx ? { ...m, role } : m)
  })),
  setSquadMemberPlaystyle: (idx, playstyleId) => set(state => ({
    squadMembers: state.squadMembers.map((m, i) => i === idx ? { ...m, playstyle: playstyleId } : m)
  })),

  // Apply full squad suggestion
  applySquadSuggestion: (memberLoadouts) => set(state => {
    const members = state.squadMembers.map((m, i) => {
      const loadout = memberLoadouts[i]
      if (!loadout) return m
      return {
        ...m,
        slots: {
          primary: loadout.primary?.item ?? null,
          secondary: loadout.secondary?.item ?? null,
          throwable: loadout.throwable?.item ?? null,
          armor: loadout.armor?.item ?? null,
          stratagems: (loadout.stratagems ?? []).map(s => s?.item ?? null),
          booster: loadout.booster?.item ?? null,
        },
        role: loadout.role ?? m.role,
        playstyle: loadout.playstyleId ?? m.playstyle,
      }
    })
    return { squadMembers: members }
  }),

  // --- Cheatsheet ---
  toggleCheatSheet: () => set(state => ({ showCheatSheet: !state.showCheatSheet })),
}))

// Auto-persist context settings on change
useLoadoutStore.subscribe((state, prev) => {
  if (
    state.selectedFactions   !== prev.selectedFactions ||
    state.selectedEnemies    !== prev.selectedEnemies ||
    state.selectedConditions !== prev.selectedConditions ||
    state.selectedPlaystyle  !== prev.selectedPlaystyle ||
    state.suggestMission     !== prev.suggestMission ||
    state.difficulty         !== prev.difficulty ||
    state.warbondFilterMode  !== prev.warbondFilterMode ||
    state.autoEnemySelection !== prev.autoEnemySelection
  ) {
    persistContext(state)
  }
})
