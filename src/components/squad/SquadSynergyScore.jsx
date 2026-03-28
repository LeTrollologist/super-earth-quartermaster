const CHECK_LABELS = {
  antiTank:     { label: 'AT Coverage',    icon: '◆' },
  crowdControl: { label: 'Crowd Control',  icon: '◇' },
  support:      { label: 'Support Items',  icon: '◈' },
  diversity:    { label: 'Weapon Variety',  icon: '◉' },
  damageTypes:  { label: 'Damage Types',   icon: '◎' },
}

export function SquadSynergyScore({ squadScore, coverageChecks }) {
  if (!coverageChecks) return null

  const color = squadScore >= 70 ? 'text-green-400' : squadScore >= 45 ? 'text-yellow-400' : 'text-red-400'
  const barColor = squadScore >= 70 ? 'bg-green-500' : squadScore >= 45 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="border border-hd-border rounded p-3 bg-hd-surface-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-hd-yellow/70">Squad Synergy</span>
        <span className={`text-sm font-mono font-bold ${color}`}>{squadScore}/100</span>
      </div>
      <div className="h-1.5 bg-hd-faded rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${squadScore}%` }} />
      </div>
      <div className="space-y-1">
        {Object.entries(CHECK_LABELS).map(([key, { label, icon }]) => {
          const check = coverageChecks[key]
          if (!check) return null
          const pass = check.pass
          return (
            <div key={key} className="flex items-center gap-2 text-[10px] font-mono">
              <span className={pass ? 'text-green-400' : 'text-red-400'}>
                {pass ? '✓' : '✕'}
              </span>
              <span className="text-hd-text-dim">{icon} {label}</span>
              {check.count !== undefined && check.target !== undefined && (
                <span className="text-hd-muted ml-auto">{check.count}/{check.target}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
