import { useState } from 'react'

export function FactionSelector({
  factions, selectedFactions, onToggleFaction,
  enemies, selectedEnemies, onToggleEnemy,
  conditions, selectedConditions, onToggleCondition,
}) {
  const [showConditions, setShowConditions] = useState(false)

  return (
    <div className="px-3 space-y-3 pb-2">
      {/* Factions */}
      <div>
        <div className="text-[10px] font-mono text-hd-text-dim mb-1.5">Active Factions</div>
        <div className="flex flex-col gap-1">
          {factions.map(f => (
            <button
              key={f.id}
              onClick={() => onToggleFaction(f.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded border text-left text-xs font-mono transition-colors ${
                selectedFactions.includes(f.id)
                  ? 'border-hd-yellow/60 bg-hd-yellow/10 text-hd-yellow'
                  : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
              }`}
            >
              <span>{f.icon}</span>
              <span className="flex-1">{f.name}</span>
              {selectedFactions.includes(f.id) && <span className="text-hd-yellow">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Enemy types (only if faction selected) */}
      {enemies.length > 0 && (
        <div>
          <div className="text-[10px] font-mono text-hd-text-dim mb-1.5">Enemy Units</div>
          <div className="flex flex-col gap-1">
            {enemies.map(e => (
              <button
                key={e.id}
                onClick={() => onToggleEnemy(e.id)}
                className={`flex items-center justify-between px-2 py-1.5 rounded border text-xs font-mono transition-colors ${
                  selectedEnemies.includes(e.id)
                    ? 'border-hd-yellow/60 bg-hd-yellow/10 text-hd-yellow'
                    : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
                }`}
              >
                <span className="flex-1 text-left truncate">{e.name}</span>
                <span className={`text-[9px] ml-1 shrink-0 ${
                  e.armorTier >= 4 ? 'text-red-400' :
                  e.armorTier >= 3 ? 'text-orange-400' : 'text-gray-400'
                }`}>
                  AP{e.armorTier}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Planet conditions */}
      <div>
        <button
          onClick={() => setShowConditions(v => !v)}
          className="text-[10px] font-mono text-hd-text-dim flex items-center gap-1 hover:text-hd-yellow transition-colors"
        >
          <span>{showConditions ? '▼' : '▶'}</span> Planet Conditions
        </button>
        {showConditions && (
          <div className="mt-1.5 flex flex-col gap-1">
            {conditions.map(c => (
              <button
                key={c.id}
                onClick={() => onToggleCondition(c.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs font-mono transition-colors ${
                  selectedConditions.includes(c.id)
                    ? 'border-blue-600/60 bg-blue-900/20 text-blue-300'
                    : 'border-hd-border text-hd-text-dim hover:border-hd-border-2'
                }`}
              >
                <span>{c.icon}</span>
                <span className="flex-1 text-left">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
