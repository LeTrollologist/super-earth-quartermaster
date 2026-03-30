import { useState, lazy, Suspense } from 'react'
import { Header } from './Header'
import { LoadoutPanel } from '../loadout/LoadoutPanel'
import { ItemBrowser } from '../browser/ItemBrowser'
import { StatsPanel } from '../stats/StatsPanel'
import { CheatSheet } from '../loadout/CheatSheet'

const SuggestPanel = lazy(() =>
  import('../suggestions/SuggestPanel').then(m => ({ default: m.SuggestPanel }))
)

const MOBILE_TABS = [
  { id: 'loadout', label: 'Loadout', icon: '🎒' },
  { id: 'browse',  label: 'Browse',  icon: '🔍' },
  { id: 'stats',   label: 'Stats',   icon: '📊' },
]

function MobileTabBar({ activeTab, onChange }) {
  return (
    <nav className="lg:hidden shrink-0 flex border-t border-hd-border bg-hd-surface">
      {MOBILE_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2.5 text-center text-xs font-mono transition-colors ${
            activeTab === tab.id
              ? 'text-hd-yellow bg-hd-yellow/10 border-t-2 border-hd-yellow'
              : 'text-hd-text-dim hover:text-hd-text'
          }`}
        >
          <span className="text-sm">{tab.icon}</span>
          <span className="ml-1">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export function AppShell() {
  const [showSuggest, setShowSuggest] = useState(false)
  const [mobileTab, setMobileTab] = useState('loadout')

  return (
    <div className="flex flex-col h-screen bg-hd-bg text-hd-text overflow-hidden bg-scanlines">
      <Header onSuggest={() => setShowSuggest(true)} />

      {/* Desktop: 3-column layout */}
      <div className="hidden lg:flex flex-1 min-h-0">
        <aside className="w-64 shrink-0 border-r border-hd-border flex flex-col bg-hd-surface overflow-hidden">
          <LoadoutPanel />
        </aside>
        <main className="flex-1 min-w-0 flex flex-col border-r border-hd-border overflow-hidden">
          <ItemBrowser />
        </main>
        <aside className="w-72 shrink-0 flex flex-col bg-hd-surface overflow-hidden">
          <StatsPanel />
        </aside>
      </div>

      {/* Mobile/Tablet: Tab-based single panel */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${mobileTab !== 'loadout' ? 'hidden' : ''}`}>
          <LoadoutPanel />
        </div>
        <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${mobileTab !== 'browse' ? 'hidden' : ''}`}>
          <ItemBrowser />
        </div>
        <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${mobileTab !== 'stats' ? 'hidden' : ''}`}>
          <StatsPanel />
        </div>
      </div>

      {/* Mobile tab bar */}
      <MobileTabBar activeTab={mobileTab} onChange={setMobileTab} />

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
