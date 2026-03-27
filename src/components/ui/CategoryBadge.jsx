const CATEGORY_STYLES = {
  AR:      'bg-blue-900/60  text-blue-300  border-blue-700',
  DMR:     'bg-cyan-900/60  text-cyan-300  border-cyan-700',
  SMG:     'bg-sky-900/60   text-sky-300   border-sky-700',
  SG:      'bg-orange-900/60 text-orange-300 border-orange-700',
  EX:      'bg-red-900/60   text-red-300   border-red-700',
  NRG:     'bg-emerald-900/60 text-emerald-300 border-emerald-700',
  HG:      'bg-gray-800     text-gray-300  border-gray-600',
  MELEE:   'bg-pink-900/60  text-pink-300  border-pink-700',
  Grenade: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  Light:   'bg-sky-900/60   text-sky-300   border-sky-700',
  Medium:  'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  Heavy:   'bg-orange-900/60 text-orange-300 border-orange-700',
  Orbital: 'bg-indigo-900/60 text-indigo-300 border-indigo-700',
  Eagle:   'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  'Support Weapon': 'bg-green-900/60 text-green-300 border-green-700',
  Backpack: 'bg-teal-900/60  text-teal-300  border-teal-700',
  Sentry:  'bg-purple-900/60 text-purple-300 border-purple-700',
  Emplacement: 'bg-red-900/60 text-red-300 border-red-700',
  Vehicle: 'bg-amber-900/60 text-amber-300 border-amber-700',
}

export function CategoryBadge({ category, className = '' }) {
  const style = CATEGORY_STYLES[category] ?? 'bg-gray-800 text-gray-300 border-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-semibold border rounded ${style} ${className}`}>
      {category}
    </span>
  )
}
