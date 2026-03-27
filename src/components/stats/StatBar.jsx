import { normalizeStat } from '../../utils/statCalc'

const LOWER_IS_BETTER = ['recoil','recoilH','recoilV','spread','sway']

function getBarColor(key, pct) {
  if (LOWER_IS_BETTER.includes(key)) {
    // Red when high (bad), green when low (good)
    if (pct > 70) return 'bg-red-500'
    if (pct > 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }
  // Green when high (good)
  if (pct > 70) return 'bg-hd-yellow'
  if (pct > 35) return 'bg-yellow-600'
  return 'bg-gray-500'
}

export function StatBar({
  label,
  value,
  statKey,
  displayValue,
  invert = false,
  className = '',
  deltaA,
  deltaB,
  isA,
}) {
  if (value === undefined || value === null) return null
  const pct = normalizeStat(statKey, value, invert)
  const barColor = getBarColor(statKey, LOWER_IS_BETTER.includes(statKey) ? pct : pct)
  const shown = displayValue ?? value

  let deltaClass = ''
  if (deltaA !== undefined && deltaB !== undefined) {
    const aWins = LOWER_IS_BETTER.includes(statKey) ? deltaA < deltaB : deltaA > deltaB
    const bWins = LOWER_IS_BETTER.includes(statKey) ? deltaB < deltaA : deltaB > deltaA
    if (isA && aWins)  deltaClass = 'text-green-400'
    if (isA && bWins)  deltaClass = 'text-red-400'
    if (!isA && bWins) deltaClass = 'text-green-400'
    if (!isA && aWins) deltaClass = 'text-red-400'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="w-28 text-xs text-hd-text-dim font-body uppercase tracking-wide shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-hd-faded rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(2, pct)}%` }}
        />
      </div>
      <span className={`w-12 text-right text-xs font-mono shrink-0 ${deltaClass || 'text-hd-text'}`}>
        {shown}
      </span>
    </div>
  )
}
