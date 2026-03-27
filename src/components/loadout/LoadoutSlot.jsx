import { useLoadoutStore } from '../../store/loadoutStore'
import { APBadge } from '../ui/APBadge'
import { CategoryBadge } from '../ui/CategoryBadge'
import { ArrowSequence } from '../ui/ArrowSequence'

const SLOT_LABELS = {
  primary:   'Primary Weapon',
  secondary: 'Sidearm',
  throwable: 'Throwable',
  armor:     'Field Armor',
  stratagem: 'Stratagem',
  booster:   'Mission Booster',
}

const SLOT_EMPTY = {
  primary:   'UNISSUED',
  secondary: 'UNISSUED',
  throwable: 'UNISSUED',
  armor:     'NO ARMOR',
  stratagem: 'EMPTY SLOT',
  booster:   'NO BOOSTER',
}

const SLOT_ICON = {
  primary:   '🔫',
  secondary: '🔫',
  throwable: '💣',
  armor:     '🛡',
  stratagem: '📡',
  booster:   '💊',
}

export function LoadoutSlot({ slotKey, stratagemIndex, item, isActive, onClick, onClear }) {
  const label = slotKey === 'stratagem'
    ? `Stratagem ${stratagemIndex + 1}`
    : SLOT_LABELS[slotKey] ?? slotKey
  const empty = SLOT_EMPTY[slotKey] ?? 'EMPTY'
  const icon  = SLOT_ICON[slotKey] ?? '?'

  return (
    <div
      className={`relative flex items-center gap-2.5 px-3 py-2.5 cursor-pointer border-l-2 transition-all group ${
        isActive
          ? 'bg-hd-yellow/10 border-l-hd-yellow'
          : 'border-l-transparent hover:bg-white/5 hover:border-l-hd-border'
      }`}
      onClick={onClick}
    >
      {/* Slot label */}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-text-dim mb-0.5">
          {label}
        </div>

        {item ? (
          <div className="space-y-1">
            <div className="text-xs font-display font-semibold text-hd-text leading-tight truncate">
              {item.name}
            </div>
            <div className="flex flex-wrap gap-1">
              {item.category  && <CategoryBadge category={item.category} />}
              {item.apTier    && <APBadge tier={item.apTier} />}
              {item.sequence  && <ArrowSequence sequence={item.sequence} />}
              {item.armorRating && (
                <span className="text-[10px] font-mono text-hd-text-dim">
                  ARM {item.armorRating} · SPD {item.speed}
                </span>
              )}
              {item.effect && !item.sequence && (
                <span className="text-[10px] font-mono text-teal-400">{item.effect}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono text-hd-muted tracking-widest">{empty}</div>
        )}
      </div>

      {/* Clear button */}
      {item && (
        <button
          onClick={e => { e.stopPropagation(); onClear() }}
          className="shrink-0 text-hd-muted hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1"
          title="Clear slot"
        >
          ✕
        </button>
      )}

      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-hd-yellow animate-pulse" />
      )}
    </div>
  )
}
