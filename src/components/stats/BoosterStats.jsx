export function BoosterStats({ booster }) {
  if (!booster) return null
  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="font-display text-lg font-bold text-hd-yellow leading-tight mb-1">{booster.name}</h2>
        <span className="px-2 py-0.5 text-xs bg-teal-900/50 border border-teal-700 text-teal-300 rounded font-mono">
          Booster
        </span>
      </div>
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
          Effect
        </div>
        <div className="bg-hd-surface-2 border border-hd-border rounded p-3">
          <div className="text-hd-yellow font-mono font-semibold text-sm mb-1">{booster.effect}</div>
          <p className="text-xs text-hd-text-dim font-body leading-relaxed">{booster.description}</p>
        </div>
      </div>
      {booster.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {booster.tags.map(t => (
            <span key={t} className="px-2 py-0.5 text-xs bg-hd-surface-2 border border-hd-border text-hd-text-dim rounded font-mono">{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
