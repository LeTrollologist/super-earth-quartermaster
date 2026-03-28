import passivesData from '../../data/passives.json'

export function PassiveTooltip({ passive, children }) {
  const data = passivesData[passive]
  if (!data || !passive) return children ?? <span>{passive}</span>

  return (
    <span className="group relative cursor-help">
      {children ?? <span>{passive}</span>}
      <span className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1.5 bg-hd-surface-2 border border-hd-border rounded text-[10px] font-mono text-hd-text leading-tight whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
        <span className="text-hd-yellow font-semibold">{data.icon ?? '◆'} {passive}</span>
        {data.description && (
          <span className="block text-hd-text-dim mt-0.5 max-w-[200px] whitespace-normal">{data.description}</span>
        )}
      </span>
    </span>
  )
}
