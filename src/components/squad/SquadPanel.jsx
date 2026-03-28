import { useLoadoutStore } from '../../store/loadoutStore'
import { ROLE_COLORS } from '../../utils/squadSuggestions'
import { WARBONDS } from '../../constants/warbonds'

function RoleBadge({ role }) {
  const color = ROLE_COLORS[role] ?? '#6b7280'
  const label = (role ?? 'flex').replace(/-/g, ' ')
  return (
    <span
      className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border"
      style={{ color, borderColor: color + '66', backgroundColor: color + '18' }}
    >
      {label}
    </span>
  )
}

function MemberColumn({ member, index, isActive, onClick }) {
  const slots = member.slots
  const primaryName   = slots.primary?.name ?? '—'
  const armorPassive  = slots.armor?.passive ?? '—'
  const supportWeapon = (slots.stratagems ?? []).find(s => s?.category === 'Support Weapon')
  const filled = [slots.primary, slots.secondary, slots.throwable, slots.armor, ...(slots.stratagems ?? []), slots.booster].filter(Boolean).length

  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-0 p-2 rounded border transition-colors text-left ${
        isActive
          ? 'border-hd-yellow/50 bg-hd-yellow/5'
          : 'border-hd-border bg-hd-surface-2 hover:border-hd-border-2'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[10px] font-display font-semibold text-hd-text truncate">{member.name}</span>
      </div>
      <RoleBadge role={member.role} />

      <div className="mt-2 space-y-1 text-[9px] font-mono">
        <div className="flex items-center gap-1">
          <span className="text-hd-muted w-8 shrink-0">PRI</span>
          <span className="text-hd-text-dim truncate">{primaryName}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-hd-muted w-8 shrink-0">SUP</span>
          <span className="text-hd-text-dim truncate">{supportWeapon?.name ?? '—'}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-hd-muted w-8 shrink-0">ARM</span>
          <span className="text-hd-text-dim truncate">{armorPassive}</span>
        </div>
      </div>

      <div className="mt-2 text-[8px] font-mono text-hd-muted">
        {filled}/8 items
      </div>
    </button>
  )
}

export function SquadPanel({ onClose }) {
  const squadMembers = useLoadoutStore(s => s.squadMembers)
  const activeSquadMember = useLoadoutStore(s => s.activeSquadMember)
  const setActiveSquadMember = useLoadoutStore(s => s.setActiveSquadMember)

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-hd-surface border border-hd-border rounded-lg max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-hd-yellow">
            Squad Overview
          </div>
          <button onClick={onClose} className="text-hd-muted hover:text-hd-text text-xs">✕</button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {squadMembers.map((member, i) => (
            <MemberColumn
              key={i}
              member={member}
              index={i}
              isActive={i === activeSquadMember}
              onClick={() => { setActiveSquadMember(i); onClose() }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
