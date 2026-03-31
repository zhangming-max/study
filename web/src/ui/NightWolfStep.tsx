import type { GameState, Action } from '../game/types'

export default function NightWolfStep(props: {
  game: GameState
  onAction: (action: Action) => void
}) {
  const aliveSeats = props.game.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b)
  const targetSeat = aliveSeats[0]

  return (
    <div style={{ padding: 16 }}>
      <h1>夜晚：狼人行动</h1>
      <div style={{ marginTop: 8 }}>狼人选择击杀对象（单机主持人代选）</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        {aliveSeats.map((seat) => (
          <button
            key={seat}
            aria-label={`狼人击杀 ${seat}`}
            onClick={() => props.onAction({ type: 'WOLF_SET', targetSeat: seat })}
            style={{ border: seat === targetSeat ? '2px solid #2563EB' : undefined }}
          >
            击杀：{seat}
          </button>
        ))}
      </div>
    </div>
  )
}

