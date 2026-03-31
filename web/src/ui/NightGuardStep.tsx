import type { GameState, Action } from '../game/types'

export default function NightGuardStep(props: {
  game: GameState
  onAction: (action: Action) => void
}) {
  const aliveSeats = props.game.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b)
  const selectedDefault = aliveSeats[0]
  // local state not required for basic flow; keep simple with first seat
  const targetSeat = selectedDefault

  return (
    <div style={{ padding: 16 }}>
      <h1>夜晚：守卫行动</h1>
      <div style={{ marginTop: 8 }}>请选择要守护的玩家（单机主持人选择）</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        {aliveSeats.map((seat) => (
          <button
            key={seat}
            aria-label={`守护座位 ${seat}`}
            onClick={() => props.onAction({ type: 'GUARD_SET', targetSeat: seat })}
            style={{ border: seat === targetSeat ? '2px solid #2563EB' : undefined }}
          >
            守护：{seat}
          </button>
        ))}
      </div>
    </div>
  )
}

