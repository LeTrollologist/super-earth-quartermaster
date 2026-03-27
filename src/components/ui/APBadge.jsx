import { AP_TIERS } from '../../utils/statCalc'

const COLORS = {
  1: 'bg-gray-700 text-gray-400 border-gray-600',
  2: 'bg-gray-700 text-gray-200 border-gray-500',
  3: 'bg-yellow-900 text-hd-yellow border-yellow-700',
  4: 'bg-orange-900 text-orange-400 border-orange-700',
  5: 'bg-red-900 text-red-400 border-red-700',
}

export function APBadge({ tier, className = '' }) {
  const info = AP_TIERS[tier] ?? AP_TIERS[1]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold border rounded ${COLORS[tier] ?? COLORS[1]} ${className}`}>
      <span className="opacity-60">AP</span>{tier} {info.label}
    </span>
  )
}
