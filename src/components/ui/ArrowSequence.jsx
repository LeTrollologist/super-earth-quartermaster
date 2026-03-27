const ARROW_MAP = {
  up:    '↑',
  down:  '↓',
  left:  '←',
  right: '→',
}

const ARROW_COLORS = {
  up:    'text-yellow-400',
  down:  'text-yellow-400',
  left:  'text-yellow-300',
  right: 'text-yellow-300',
}

export function ArrowSequence({ sequence = [], size = 'sm', animate = false }) {
  const sizeClass = size === 'lg' ? 'text-2xl gap-1.5 p-1.5' : 'text-base gap-1 p-1'

  return (
    <div className={`inline-flex items-center ${sizeClass} bg-black/40 border border-hd-border rounded font-mono`}>
      {sequence.map((dir, i) => (
        <span
          key={i}
          className={`${ARROW_COLORS[dir]} font-bold leading-none ${animate ? 'animate-pulse_yellow' : ''}`}
          style={animate ? { animationDelay: `${i * 0.15}s` } : {}}
        >
          {ARROW_MAP[dir] ?? dir}
        </span>
      ))}
    </div>
  )
}
