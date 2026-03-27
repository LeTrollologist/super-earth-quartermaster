import { useState } from 'react'

export function Tooltip({ content, children, className = '' }) {
  const [visible, setVisible] = useState(false)

  if (!content) return children

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 text-xs bg-hd-surface-2 border border-hd-border text-hd-text px-3 py-2 rounded shadow-xl pointer-events-none animate-fadeIn">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-hd-border" />
        </div>
      )}
    </div>
  )
}
