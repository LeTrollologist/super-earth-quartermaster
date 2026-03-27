import { useEffect, useState } from 'react'
import { useLoadoutStore } from '../../store/loadoutStore'
import { useWarStatus } from '../../hooks/useWarStatus'

function SEAFLogo() {
  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Eagle icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-hd-yellow">
        <polygon points="16,2 20,12 30,12 22,19 25,30 16,24 7,30 10,19 2,12 12,12" fill="currentColor" opacity="0.9"/>
      </svg>
      <div className="leading-none">
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

  const compareMode  = useLoadoutStore(s => s.compareMode)
  const toggleCompare = useLoadoutStore(s => s.toggleCompare)
  const clearLoadout  = useLoadoutStore(s => s.clearLoadout)

  return (
    <header className="shrink-0 h-14 bg-hd-surface border-b border-hd-border flex items-center px-4 gap-4 z-20">
      <SEAFLogo />

      {/* Divider */}
      <div className="h-6 w-px bg-hd-border" />

      {/* War status ticker */}
      <WarTicker warData={warData} campaigns={campaigns} planets={planets} loading={loading} error={error} />

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSuggest}
          className="px-3 py-1.5 text-xs font-mono border border-hd-yellow text-hd-yellow bg-hd-yellow/10 hover:bg-hd-yellow/20 rounded transition-colors font-semibold"
        >
          ◈ Suggest Loadout
        </button>
        <div className="h-4 w-px bg-hd-border" />
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
          onClick={clearLoadout}
          className="px-3 py-1.5 text-xs font-mono border border-hd-border text-hd-text-dim hover:border-red-700 hover:text-red-400 rounded transition-colors"
        >
          ✕ Clear
        </button>
      </div>
    </header>
  )
}
