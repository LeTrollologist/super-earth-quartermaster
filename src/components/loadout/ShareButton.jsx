import { useState, useRef } from 'react'
import { useLoadoutURL } from '../../hooks/useLoadoutURL'
import { useLoadoutStore } from '../../store/loadoutStore'
import { exportLoadoutJSON, importLoadoutJSON } from '../../utils/loadoutCodec'
import weaponsData   from '../../data/weapons.json'
import armorData     from '../../data/armor.json'
import stratagemData from '../../data/stratagems.json'
import boosterData   from '../../data/boosters.json'

export function ShareButton() {
  const [copied, setCopied] = useState(false)
  const [exported, setExported] = useState(false)
  const [importError, setImportError] = useState(null)
  const fileRef = useRef(null)
  const { getShareURL } = useLoadoutURL()
  const slots = useLoadoutStore(s => s.slots)
  const setSlot = useLoadoutStore(s => s.setSlot)
  const setStratagemSlot = useLoadoutStore(s => s.setStratagemSlot)

  function handleCopy() {
    const url = getShareURL()
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleExportJSON() {
    const json = exportLoadoutJSON(slots)
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'loadout.json'
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }

  function handleImportJSON(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const decoded = importLoadoutJSON(reader.result, {
        weapons: weaponsData, armor: armorData, stratagems: stratagemData, boosters: boosterData,
      })
      if (!decoded) {
        setImportError('Invalid loadout file')
        setTimeout(() => setImportError(null), 3000)
        return
      }
      if (decoded.primary)   setSlot('primary',   decoded.primary)
      if (decoded.secondary) setSlot('secondary',  decoded.secondary)
      if (decoded.throwable) setSlot('throwable',  decoded.throwable)
      if (decoded.armor)     setSlot('armor',      decoded.armor)
      if (decoded.booster)   setSlot('booster',    decoded.booster)
      decoded.stratagems.forEach((s, i) => { if (s) setStratagemSlot(i, s) })
    }
    reader.readAsText(file)
    // Reset input so same file can be re-imported
    e.target.value = ''
  }

  const btnBase = 'py-1.5 text-[10px] font-mono border rounded transition-all'

  return (
    <div className="space-y-1.5">
      {/* Transmit link */}
      <button
        onClick={handleCopy}
        className={`w-full py-2 text-xs font-mono border rounded transition-all ${
          copied
            ? 'border-green-600 bg-green-900/30 text-green-400'
            : 'border-hd-border text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow'
        }`}
      >
        {copied ? '\u2713 LINK COPIED' : '\u2B21 TRANSMIT LOADOUT'}
      </button>

      {/* Export / Import row */}
      <div className="flex gap-1.5">
        <button
          onClick={handleExportJSON}
          className={`flex-1 ${btnBase} ${
            exported
              ? 'border-green-600 bg-green-900/30 text-green-400'
              : 'border-hd-border text-hd-text-dim hover:border-teal-500/50 hover:text-teal-400'
          }`}
        >
          {exported ? '\u2713 SAVED' : '\u2193 EXPORT JSON'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className={`flex-1 ${btnBase} ${
            importError
              ? 'border-red-600 bg-red-900/30 text-red-400'
              : 'border-hd-border text-hd-text-dim hover:border-teal-500/50 hover:text-teal-400'
          }`}
        >
          {importError ?? '\u2191 IMPORT JSON'}
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
      </div>
    </div>
  )
}
