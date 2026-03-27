import { useState } from 'react'
import { useLoadoutURL } from '../../hooks/useLoadoutURL'

export function ShareButton() {
  const [copied, setCopied] = useState(false)
  const { getShareURL } = useLoadoutURL()

  function handleCopy() {
    const url = getShareURL()
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`w-full py-2 text-xs font-mono border rounded transition-all ${
        copied
          ? 'border-green-600 bg-green-900/30 text-green-400'
          : 'border-hd-border text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow'
      }`}
    >
      {copied ? '✓ LINK COPIED' : '⬡ TRANSMIT LOADOUT'}
    </button>
  )
}
