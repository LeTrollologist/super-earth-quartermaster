import { useLoadoutStore } from '../../store/loadoutStore'
import { ArrowSequence } from '../ui/ArrowSequence'

export function CheatSheet() {
  const showCheatSheet = useLoadoutStore(s => s.showCheatSheet)
  const toggleCheatSheet = useLoadoutStore(s => s.toggleCheatSheet)
  const getActiveSlots = useLoadoutStore(s => s.getActiveSlots)
  const slots = getActiveSlots()
  const stratagems = slots.stratagems ?? []

  if (!showCheatSheet) return null

  const filled = stratagems.filter(Boolean)
  if (filled.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-30 bg-hd-surface border border-hd-border rounded-lg shadow-xl p-3 min-w-[220px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/70">
          Stratagem Cheat Sheet
        </div>
        <button
          onClick={toggleCheatSheet}
          className="text-hd-muted hover:text-hd-text text-xs"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2">
        {stratagems.map((strat, i) => {
          if (!strat) return (
            <div key={i} className="flex items-center gap-2 opacity-30">
              <span className="text-[10px] font-mono text-hd-muted w-4">{i + 1}.</span>
              <span className="text-[10px] font-mono text-hd-muted italic">Empty</span>
            </div>
          )
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-hd-yellow/50 w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-display font-semibold text-hd-text truncate leading-tight">
                  {strat.name}
                </div>
                <div className="mt-0.5">
                  <ArrowSequence sequence={strat.sequence} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
