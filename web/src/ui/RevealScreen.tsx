import { useMemo, useState } from 'react'
import type { GameState } from '../game/types'
import PlayerSeatGrid from './PlayerSeatGrid'

export default function RevealScreen(props: {
  game: GameState
  onAdvance: () => void
}) {
  const [revealedSeats, setRevealedSeats] = useState<Set<number>>(() => new Set())
  const [revealingSeat, setRevealingSeat] = useState<number | null>(null)
  const doneSeats = useMemo(() => revealedSeats.size, [revealedSeats])

  const revealingRole = useMemo(() => {
    if (revealingSeat === null) return null
    return props.game.players.find(p => p.seat === revealingSeat)?.role ?? null
  }, [props.game.players, revealingSeat])

  return (
    <div style={{ padding: 16 }}>
      <h1>狼人杀</h1>
      <div style={{ marginTop: 8, fontWeight: 600 }}>身份查看</div>
      <div>身份查看进度：{doneSeats}/8</div>
      <PlayerSeatGrid
        seats={props.game.players.map((p) => p.seat)}
        onSeatClick={(seat) => {
          if (revealedSeats.has(seat)) return
          setRevealingSeat(seat)
        }}
        revealedSeats={revealedSeats}
      />
      <button onClick={props.onAdvance} aria-label="进入夜晚阶段">
        下一步
      </button>

      {revealingSeat !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'rgba(248, 250, 252, 0.95)',
              border: '1px solid rgba(15, 23, 42, 0.15)',
              borderRadius: 16,
              padding: 16,
              maxWidth: 520,
              width: '100%',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18 }}>请交给玩家查看身份</div>
            <div style={{ marginTop: 8 }}>座位：{revealingSeat}</div>
            <div style={{ marginTop: 12, fontWeight: 900, fontSize: 22, color: '#2563EB' }}>
              身份：{revealingRole}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setRevealingSeat(null)} aria-label="关闭身份弹窗">
                关闭
              </button>
              <button
                onClick={() => {
                  setRevealedSeats(prev => {
                    const next = new Set(prev)
                    next.add(revealingSeat)
                    return next
                  })
                  setRevealingSeat(null)
                }}
                aria-label="交给下一位"
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: 12,
                }}
              >
                交给下一位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

