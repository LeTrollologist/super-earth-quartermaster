import { useState, useMemo } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { ItemCard } from './ItemCard'
import { WARBONDS, WARBOND_ORDER } from '../../constants/warbonds'
import weaponsData   from '../../data/weapons.json'
import armorData     from '../../data/armor.json'
import stratagemData from '../../data/stratagems.json'
import boosterData   from '../../data/boosters.json'

const SLOT_ITEMS = {
  primary:   weaponsData.primaries,
  secondary: weaponsData.secondaries,
  throwable: weaponsData.throwables,
  armor:     armorData,
  stratagem: stratagemData,
  booster:   boosterData,
}

const SLOT_FILTERS = {
  primary:  ['All','AR','DMR','SMG','SG','EX','NRG'],
  secondary:['All','HG','NRG','SG','MELEE'],
  throwable:['All','Grenade','Thrown'],
  armor:    ['All','Light','Medium','Heavy'],
  stratagem:['All','Orbital','Eagle','Support Weapon','Backpack','Sentry','Emplacement','Vehicle'],
  booster:  ['All'],
}

const SLOT_SECTION_TITLE = {
  primary:   'Primary Weapons',
  secondary: 'Sidearms',
  throwable: 'Throwables',
  armor:     'Field Armor',
  stratagem: 'Stratagems',
  booster:   'Mission Boosters',
}

const SLOT_FLAVOR = {
  primary:   '"Your primary instrument of democracy."',
  secondary: '"A backup. The Ministry hopes you won\'t need it."',
  throwable: '"Precision munitions. Handle with conviction."',
  armor:     '"Ministry-certified protection. Results may vary."',
  stratagem: '"Authorized Support Assets — use them wisely."',
  booster:   '"Pre-mission biochemical enhancements. Waiver waived."',
}

const SORT_OPTIONS = [
  { value: 'name',       label: 'Name' },
  { value: 'damage',     label: 'Damage' },
  { value: 'dps',        label: 'DPS' },
  { value: 'apTier',     label: 'AP Tier' },
  { value: 'cooldown',   label: 'Cooldown' },
  { value: 'armorRating',label: 'Armor' },
]

function getFilterKey(item) {
  return item.category ?? item.type ?? item.faction ?? 'Other'
}

export function ItemBrowser() {
  const activeSlot       = useLoadoutStore(s => s.activeSlot)
  const activeStrIdx     = useLoadoutStore(s => s.activeStratagemIndex)
  const getActiveSlots   = useLoadoutStore(s => s.getActiveSlots)
  const slots            = getActiveSlots()
  const setSlot          = useLoadoutStore(s => s.setSlot)
  const setStratagemSlot = useLoadoutStore(s => s.setStratagemSlot)
  const setHovered       = useLoadoutStore(s => s.setHovered)
  const clearHovered     = useLoadoutStore(s => s.clearHovered)
  const compareMode      = useLoadoutStore(s => s.compareMode)
  const setCompareItem   = useLoadoutStore(s => s.setCompareItem)
  const compareItems     = useLoadoutStore(s => s.compareItems)

  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('All')
  const [warbondFilter, setWarbondFilter] = useState('All')
  const [sort,        setSort]        = useState('name')
  const [sortDir,     setSortDir]     = useState(1)
  const [showWarbonds, setShowWarbonds] = useState(false)

  const items = SLOT_ITEMS[activeSlot] ?? []
  const filters = SLOT_FILTERS[activeSlot] ?? ['All']

  // Get warbonds present in current items
  const availableWarbonds = useMemo(() => {
    const wb = new Set()
    items.forEach(i => { if (i.warbond) wb.add(i.warbond) })
    return WARBOND_ORDER.filter(w => wb.has(w))
  }, [items])

  // Reset filter when slot changes
  const [prevSlot, setPrevSlot] = useState(activeSlot)
  if (prevSlot !== activeSlot) {
    setSearch(''); setFilter('All'); setWarbondFilter('All'); setPrevSlot(activeSlot)
  }

  const filtered = useMemo(() => {
    let list = [...items]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.passive?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q) ||
        i.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    if (filter !== 'All') {
      list = list.filter(i => getFilterKey(i) === filter)
    }

    if (warbondFilter !== 'All') {
      list = list.filter(i => i.warbond === warbondFilter)
    }

    list.sort((a, b) => {
      const va = a[sort] ?? a.name ?? ''
      const vb = b[sort] ?? b.name ?? ''
      if (typeof va === 'string') return sortDir * va.localeCompare(vb)
      return sortDir * ((va ?? 0) - (vb ?? 0))
    })

    return list
  }, [items, search, filter, warbondFilter, sort, sortDir])

  function isSelected(item) {
    if (activeSlot === 'stratagem') return slots.stratagems[activeStrIdx]?.id === item.id
    return slots[activeSlot]?.id === item.id
  }

  function handleSelect(item) {
    if (activeSlot === 'stratagem') setStratagemSlot(activeStrIdx, item)
    else setSlot(activeSlot, item)
  }

  function handleCompare(item) {
    const idx = compareItems[0] === null ? 0 : 1
    setCompareItem(idx, item)
  }

  function toggleSort(key) {
    if (sort === key) setSortDir(d => -d)
    else { setSort(key); setSortDir(1) }
  }

  const wbColor = warbondFilter !== 'All' ? WARBONDS[warbondFilter]?.color : null

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-2.5 border-b border-hd-border shrink-0">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70">
            {SLOT_SECTION_TITLE[activeSlot] ?? 'Equipment'}
          </div>
          <div className="text-[10px] font-mono text-hd-muted">
            {filtered.length} items
          </div>
        </div>
        <div className="text-[10px] font-body italic text-hd-muted">
          {SLOT_FLAVOR[activeSlot] ?? ''}
        </div>
      </div>

      {/* Search + filters */}
      <div className="px-3 py-2 border-b border-hd-border shrink-0 space-y-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search equipment..."
          className="w-full bg-hd-surface-2 border border-hd-border rounded px-3 py-1.5 text-xs font-mono text-hd-text placeholder-hd-muted focus:outline-none focus:border-hd-yellow/50 transition-colors"
        />

        {/* Category filter chips */}
        {filters.length > 1 && (
          <div className="flex gap-1 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 text-[10px] font-mono border rounded transition-colors ${
                  filter === f
                    ? 'bg-hd-yellow text-hd-bg border-hd-yellow font-bold'
                    : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Warbond filter row */}
        {availableWarbonds.length > 0 && (
          <div>
            <button
              onClick={() => setShowWarbonds(w => !w)}
              className="text-[9px] font-mono text-hd-muted hover:text-hd-yellow transition-colors mb-1"
            >
              {showWarbonds ? '▼' : '▶'} WARBOND FILTER {warbondFilter !== 'All' ? `· ${WARBONDS[warbondFilter]?.label}` : ''}
            </button>
            {showWarbonds && (
              <div className="flex gap-1 flex-wrap">
                <button
                  onClick={() => setWarbondFilter('All')}
                  className={`px-2 py-0.5 text-[10px] font-mono border rounded transition-colors ${
                    warbondFilter === 'All'
                      ? 'bg-hd-yellow/20 border-hd-yellow text-hd-yellow'
                      : 'border-hd-border text-hd-muted hover:border-hd-border-2'
                  }`}
                >
                  All
                </button>
                {availableWarbonds.map(wb => {
                  const info = WARBONDS[wb]
                  const active = warbondFilter === wb
                  return (
                    <button
                      key={wb}
                      onClick={() => setWarbondFilter(wb)}
                      style={active ? { backgroundColor: info.color + '30', borderColor: info.color, color: info.color } : { borderColor: info.color + '40' }}
                      className="px-2 py-0.5 text-[10px] font-mono border rounded transition-colors hover:opacity-100 opacity-70 hover:opacity-100"
                    >
                      {info.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Sort */}
        <div className="flex gap-1 flex-wrap">
          {SORT_OPTIONS.filter(o => items.some(i => i[o.value] !== undefined)).map(o => (
            <button
              key={o.value}
              onClick={() => toggleSort(o.value)}
              className={`px-2 py-0.5 text-[10px] font-mono border rounded transition-colors ${
                sort === o.value
                  ? 'border-hd-yellow/50 text-hd-yellow'
                  : 'border-hd-border text-hd-muted hover:border-hd-border-2'
              }`}
            >
              {o.label} {sort === o.value ? (sortDir === 1 ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Item grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <div className="text-2xl mb-2">🔍</div>
            <div className="text-xs font-mono text-hd-text-dim">No equipment found</div>
            <div className="text-[10px] font-body text-hd-muted mt-1">Try adjusting your search</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filtered.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={isSelected(item)}
                onClick={() => handleSelect(item)}
                onHover={setHovered}
                onHoverEnd={clearHovered}
                compareMode={compareMode}
                onCompare={() => handleCompare(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
