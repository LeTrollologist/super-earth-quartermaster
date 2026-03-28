import { useState } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'

export function PresetManager() {
  const [expanded, setExpanded] = useState(false)
  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')
  const presets = useLoadoutStore(s => s.presets)
  const savePreset = useLoadoutStore(s => s.savePreset)
  const loadPreset = useLoadoutStore(s => s.loadPreset)
  const deletePreset = useLoadoutStore(s => s.deletePreset)

  const handleSave = () => {
    if (!newName.trim()) return
    savePreset(newName.trim())
    setNewName('')
    setNaming(false)
  }

  return (
    <div className="mx-3 mb-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-1"
      >
        <span className="text-[9px] font-mono uppercase tracking-widest text-hd-yellow/50">
          ◆ Presets {presets.length > 0 && `(${presets.length})`}
        </span>
        <span className="text-[9px] font-mono text-hd-muted">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="pb-2 space-y-1">
          {presets.length === 0 && (
            <div className="text-[9px] font-mono text-hd-muted italic px-1">No saved presets</div>
          )}
          {presets.map((preset, i) => (
            <div key={i} className="flex items-center gap-1 px-1">
              <button
                onClick={() => loadPreset(i)}
                className="flex-1 text-left text-[10px] font-mono text-hd-text-dim hover:text-hd-yellow truncate transition-colors"
                title={`Load: ${preset.name}`}
              >
                {preset.name}
              </button>
              <button
                onClick={() => deletePreset(i)}
                className="text-[9px] text-hd-muted hover:text-red-400 shrink-0 transition-colors"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}

          {naming ? (
            <div className="flex items-center gap-1 px-1 mt-1">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Preset name..."
                className="flex-1 bg-hd-surface-2 border border-hd-border rounded px-1.5 py-0.5 text-[10px] font-mono text-hd-text placeholder:text-hd-muted/50 outline-none focus:border-hd-yellow/50"
              />
              <button onClick={handleSave} className="text-[9px] font-mono text-hd-yellow hover:text-hd-yellow/80">Save</button>
              <button onClick={() => setNaming(false)} className="text-[9px] font-mono text-hd-muted">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => { if (presets.length >= 5) return; setNaming(true) }}
              disabled={presets.length >= 5}
              className="w-full text-[9px] font-mono text-hd-yellow/60 hover:text-hd-yellow disabled:opacity-30 disabled:cursor-not-allowed text-center py-0.5 border border-dashed border-hd-border rounded transition-colors"
            >
              + Save Current
            </button>
          )}
        </div>
      )}
    </div>
  )
}
