import { useState, lazy, Suspense } from 'react'
import { Header } from './Header'
import { LoadoutPanel } from '../loadout/LoadoutPanel'
import { ItemBrowser } from '../browser/ItemBrowser'
import { StatsPanel } from '../stats/StatsPanel'
import { CheatSheet } from '../loadout/CheatSheet'

const SuggestPanel = lazy(() =>
  import('../suggestions/SuggestPanel').then(m => ({ default: m.SuggestPanel }))
)

export function AppShell() {
  const [showSuggest, setShowSuggest] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-hd-bg text-hd-text overflow-hidden bg-scanlines">
      <Header onSuggest={() => setShowSuggest(true)} />
      <div className="flex flex-1 min-h-0">
        {/* Left: Loadout */}
        <aside className="w-64 shrink-0 border-r border-hd-border flex flex-col bg-hd-surface overflow-hidden">
          <LoadoutPanel />
        </aside>

        {/* Center: Item Browser */}
        <main className="flex-1 min-w-0 flex flex-col border-r border-hd-border overflow-hidden">
          <ItemBrowser />
        </main>

        {/* Right: Stats */}
        <aside className="w-72 shrink-0 flex flex-col bg-hd-surface overflow-hidden">
          <StatsPanel />
        </aside>
      </div>

      {/* Suggestion overlay (lazy loaded) */}
      {showSuggest && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="text-hd-yellow font-mono text-sm animate-pulse">INITIALIZING QUARTERMASTER...</div>
          </div>
        }>
          <SuggestPanel onClose={() => setShowSuggest(false)} />
        </Suspense>
      )}

      {/* Stratagem cheat sheet overlay */}
      <CheatSheet />
    </div>
  )
}
