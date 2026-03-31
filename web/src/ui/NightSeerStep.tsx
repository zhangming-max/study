import type { GameState, Action } from '../game/types'
import { useMemo, useState } from 'react'

export default function NightSeerStep(props: { game: GameState; onAction: (a: Action) => void }) {
  const aliveSeats = useMemo(
    () => props.game.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b),
    [props.game.players],
  )
  const [selectedSeat, setSelectedSeat] = useState<number | undefined>(aliveSeats[0])

  const hasResult = typeof props.game.night.seerResult === 'string'

  return (
    <div style={{ padding: 16 }}>
      <h1>夜晚：预言家行动</h1>

      {!hasResult && (
        <>
          <div style={{ marginTop: 8 }}>选择要查验的目标（主持人选择）</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
            {aliveSeats.map((seat) => (
              <button
                key={seat}
                aria-label={`查验座位 ${seat}`}
                onClick={() => setSelectedSeat(seat)}
                style={{ border: seat === selectedSeat ? '2px solid #2563EB' : undefined }}
              >
                座位：{seat}
              </button>
            ))}
          </div>
          <button
            onClick={() => props.onAction({ type: 'SEER_CHECK', targetSeat: selectedSeat ?? aliveSeats[0] })}
            aria-label="确认查验"
            style={{ marginTop: 12 }}
          >
            查验
          </button>
        </>
      )}

      {hasResult && (
        <>
          <div style={{ marginTop: 12, fontWeight: 700 }}>
            预言家结果：{props.game.night.seerResult}
          </div>
          <button onClick={() => props.onAction({ type: 'ADVANCE_PHASE' })} aria-label="进入白天" style={{ marginTop: 12 }}>
            进入白天
          </button>
        </>
      )}
    </div>
  )
}

