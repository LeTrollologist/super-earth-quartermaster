import { DAMAGE_TYPES } from '../../utils/statCalc'

const STYLES = {
  Ballistic: 'bg-gray-800 text-gray-300 border-gray-600',
  Explosive: 'bg-yellow-900 text-yellow-300 border-yellow-700',
  Fire:      'bg-red-900 text-red-300 border-red-700',
  Arc:       'bg-purple-900 text-purple-300 border-purple-700',
  Laser:     'bg-emerald-900 text-emerald-300 border-emerald-700',
  None:      'bg-gray-900 text-gray-500 border-gray-700',
}

export function DamageTypeBadge({ type, className = '' }) {
  const info = DAMAGE_TYPES[type] ?? DAMAGE_TYPES['None']
  const style = STYLES[type] ?? STYLES['None']
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border rounded ${style} ${className}`}>
      <span>{info.icon}</span> {type}
    </span>
  )
}
