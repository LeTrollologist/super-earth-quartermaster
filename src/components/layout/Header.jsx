import { useState } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { useWarStatus } from '../../hooks/useWarStatus'
import weaponsData   from '../../data/weapons.json'
import armorData     from '../../data/armor.json'
import stratagemData from '../../data/stratagems.json'
import boosterData   from '../../data/boosters.json'

function SEAFLogo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-hd-yellow">
        <polygon points="16,2 20,12 30,12 22,19 25,30 16,24 7,30 10,19 2,12 12,12" fill="currentColor" opacity="0.9"/>
      </svg>
      <div className="leading-none hidden sm:block">
        <div className="font-display font-bold text-hd-yellow text-base tracking-widest uppercase">
          Super Earth
        </div>
        <div className="font-body text-xs text-hd-yellow/60 tracking-[0.3em] uppercase">
          Quartermaster
        </div>
      </div>
    </div>
  )
}

function WarTicker({ warData, campaigns, planets, loading, error }) {
  if (loading) return (
    <div className="flex-1 overflow-hidden flex items-center">
      <span className="text-xs font-mono text-hd-text-dim animate-pulse_yellow">
        ◎ CONNECTING TO SUPER EARTH COMMAND...
      </span>
    </div>
  )

  if (error || !warData) return (
    <div className="flex-1 overflow-hidden flex items-center">
      <span className="text-xs font-mono text-hd-muted">
        ◎ WAR STATUS UNAVAILABLE — STAND BY
      </span>
    </div>
  )

  const stats = warData.statistics
  const activePlanets = campaigns?.length ?? 0

  const tickerContent = [
    stats?.missionsWon    && `⚔ MISSIONS WON: ${stats.missionsWon.toLocaleString()}`,
    stats?.kills          && `💀 KILLS: ${stats.kills.toLocaleString()}`,
    activePlanets         && `🌍 ACTIVE FRONTS: ${activePlanets}`,
    stats?.playerCount    && `👤 HELLDIVERS DEPLOYED: ${stats.playerCount?.toLocaleString()}`,
    stats?.bulletsFired   && `🔫 ROUNDS FIRED: ${stats.bulletsFired?.toLocaleString()}`,
    stats?.deaths         && `☠ HELLDIVER LOSSES: ${stats.deaths?.toLocaleString()}`,
  ].filter(Boolean).join('   ◆   ')

  return (
    <div className="flex-1 overflow-hidden flex items-center min-w-0">
      <div className="overflow-hidden w-full">
        <div className="animate-ticker whitespace-nowrap text-xs font-mono text-hd-yellow/70">
          {tickerContent}{'   ◆   '}{tickerContent}
        </div>
      </div>
    </div>
  )
}

export function Header({ onSuggest }) {
  const { warData, campaigns, planets, loading, error } = useWarStatus()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const compareMode      = useLoadoutStore(s => s.compareMode)
  const toggleCompare    = useLoadoutStore(s => s.toggleCompare)
  const clearLoadout     = useLoadoutStore(s => s.clearLoadout)
  const squadMode        = useLoadoutStore(s => s.squadMode)
  const toggleSquadMode  = useLoadoutStore(s => s.toggleSquadMode)
  const toggleCheatSheet = useLoadoutStore(s => s.toggleCheatSheet)
  const showCheatSheet   = useLoadoutStore(s => s.showCheatSheet)
  const randomizeLoadout = useLoadoutStore(s => s.randomizeLoadout)

  const handleRandom = () => {
    randomizeLoadout(weaponsData, armorData, stratagemData, boosterData)
  }

  const btnClass = (active, activeColor = 'hd-yellow') => `px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
    active
      ? `bg-${activeColor}/20 text-${activeColor} border-${activeColor}/50`
      : 'border-hd-border text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow'
  }`

  return (
    <header className="shrink-0 bg-hd-surface border-b border-hd-border z-20">
      {/* Main header row */}
      <div className="h-14 flex items-center px-3 sm:px-4 gap-2 sm:gap-4">
        <SEAFLogo />
        <div className="hidden md:block h-6 w-px bg-hd-border" />
        <div className="hidden md:flex flex-1 min-w-0">
          <WarTicker warData={warData} campaigns={campaigns} planets={planets} loading={loading} error={error} />
        </div>

        {/* Mobile: just Suggest + menu toggle */}
        <div className="flex-1 md:hidden" />
        <button
          onClick={onSuggest}
          className="px-3 py-1.5 text-xs font-mono border border-hd-yellow text-hd-yellow bg-hd-yellow/10 hover:bg-hd-yellow/20 rounded transition-colors font-semibold"
        >
          ◈ Suggest
        </button>

        {/* Desktop action buttons */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={handleRandom}
            className="px-3 py-1.5 text-xs font-mono border border-hd-border text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow rounded transition-colors"
            title="Random loadout"
          >
            ⚄ Random
          </button>
          <div className="h-4 w-px bg-hd-border" />
          <button
            onClick={toggleSquadMode}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              squadMode
                ? 'bg-hd-blue/20 text-hd-blue border-hd-blue/50'
                : 'border-hd-border text-hd-text-dim hover:border-hd-blue/50 hover:text-hd-blue'
            }`}
          >
            {squadMode ? '◈ Squad' : '◇ Solo'}
          </button>
          <button
            onClick={toggleCompare}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              compareMode
                ? 'bg-hd-yellow text-hd-bg border-hd-yellow'
                : 'border-hd-border text-hd-text-dim hover:border-hd-yellow/50 hover:text-hd-yellow'
            }`}
          >
            ⊕ Compare
          </button>
          <button
            onClick={toggleCheatSheet}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              showCheatSheet
                ? 'bg-hd-green/20 text-hd-green border-hd-green/50'
                : 'border-hd-border text-hd-text-dim hover:border-hd-green/50 hover:text-hd-green'
            }`}
            title="Stratagem cheat sheet"
          >
            ↕ Keys
          </button>
          <button
            onClick={clearLoadout}
            className="px-3 py-1.5 text-xs font-mono border border-hd-border text-hd-text-dim hover:border-red-700 hover:text-red-400 rounded transition-colors"
          >
            ✕ Clear
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden px-2 py-1.5 text-xs font-mono border border-hd-border text-hd-text-dim hover:text-hd-yellow rounded transition-colors"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-hd-border bg-hd-surface px-3 py-2 flex flex-wrap gap-2">
          <button onClick={() => { handleRandom(); setMobileMenuOpen(false) }}
            className="px-3 py-1.5 text-xs font-mono border border-hd-border text-hd-text-dim hover:text-hd-yellow rounded transition-colors">
            ⚄ Random
          </button>
          <button onClick={() => { toggleSquadMode(); setMobileMenuOpen(false) }}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              squadMode ? 'bg-hd-blue/20 text-hd-blue border-hd-blue/50' : 'border-hd-border text-hd-text-dim hover:text-hd-blue'
            }`}>
            {squadMode ? '◈ Squad' : '◇ Solo'}
          </button>
          <button onClick={() => { toggleCompare(); setMobileMenuOpen(false) }}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              compareMode ? 'bg-hd-yellow text-hd-bg border-hd-yellow' : 'border-hd-border text-hd-text-dim hover:text-hd-yellow'
            }`}>
            ⊕ Compare
          </button>
          <button onClick={() => { toggleCheatSheet(); setMobileMenuOpen(false) }}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              showCheatSheet ? 'bg-hd-green/20 text-hd-green border-hd-green/50' : 'border-hd-border text-hd-text-dim hover:text-hd-green'
            }`}>
            ↕ Keys
          </button>
          <button onClick={() => { clearLoadout(); setMobileMenuOpen(false) }}
            className="px-3 py-1.5 text-xs font-mono border border-hd-border text-hd-text-dim hover:text-red-400 rounded transition-colors">
            ✕ Clear
          </button>
        </div>
      )}
    </header>
  )
}
