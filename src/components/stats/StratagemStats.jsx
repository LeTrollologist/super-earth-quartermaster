import { CategoryBadge } from '../ui/CategoryBadge'
import { ArrowSequence } from '../ui/ArrowSequence'

export function StratagemStats({ stratagem, effectivenessScore }) {
  if (!stratagem) return null

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-display text-lg font-bold text-hd-yellow leading-tight">{stratagem.name}</h2>
          {effectivenessScore !== null && effectivenessScore !== undefined && (
            <div className={`shrink-0 text-xs font-mono px-2 py-1 rounded border ${
              effectivenessScore >= 70 ? 'border-green-600 text-green-400 bg-green-900/30' :
              effectivenessScore >= 40 ? 'border-yellow-600 text-yellow-400 bg-yellow-900/30' :
                                          'border-red-600 text-red-400 bg-red-900/30'
            }`}>
              {effectivenessScore}% vs enemies
            </div>
          )}
        </div>
        <CategoryBadge category={stratagem.category} />
        {stratagem.description && (
          <p className="text-xs text-hd-text-dim font-body mt-2 leading-relaxed">{stratagem.description}</p>
        )}
      </div>

      {/* Input Sequence */}
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
          Input Sequence
        </div>
        <ArrowSequence sequence={stratagem.sequence} size="lg" />
      </div>

      {/* Combat Stats */}
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
          Stats
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-hd-surface-2 border border-hd-border rounded p-2 text-center">
            <div className="text-xl font-mono font-bold text-hd-yellow">
              {stratagem.cooldown}s
            </div>
            <div className="text-xs text-hd-text-dim font-body uppercase tracking-wide mt-0.5">Cooldown</div>
          </div>
          <div className="bg-hd-surface-2 border border-hd-border rounded p-2 text-center">
            <div className="text-xl font-mono font-bold text-hd-yellow">
              {stratagem.uses === -1 ? '∞' : `×${stratagem.uses}`}
            </div>
            <div className="text-xs text-hd-text-dim font-body uppercase tracking-wide mt-0.5">Uses</div>
          </div>
          <div className="bg-hd-surface-2 border border-hd-border rounded p-2 text-center">
            <div className="text-xl font-mono font-bold text-hd-yellow">
              {stratagem.activation}s
            </div>
            <div className="text-xs text-hd-text-dim font-body uppercase tracking-wide mt-0.5">Call-In</div>
          </div>
          <div className="bg-hd-surface-2 border border-hd-border rounded p-2 text-center">
            <div className="text-xl font-mono font-bold text-hd-yellow">
              {stratagem.sequence.length}
            </div>
            <div className="text-xs text-hd-text-dim font-body uppercase tracking-wide mt-0.5">Inputs</div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {stratagem.tags?.length > 0 && (
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-hd-yellow/70 mb-2 pb-1 border-b border-hd-border">
            Effective Against
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stratagem.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs bg-hd-surface-2 border border-hd-border text-hd-text-dim rounded font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
