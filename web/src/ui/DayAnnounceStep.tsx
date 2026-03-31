import type { GameState, Action } from '../game/types'

export default function DayAnnounceStep(props: { game: GameState; onAction: (a: Action) => void }) {
  const deathSeat = props.game.night.finalDeathSeat
  return (
    <div style={{ padding: 16 }}>
      <h1>白天：公布死亡</h1>
      <div style={{ marginTop: 8, fontWeight: 600 }}>
        {typeof deathSeat === 'number' ? `昨夜死者：座位 ${deathSeat}` : '平安夜'}
      </div>
      <button onClick={() => props.onAction({ type: 'ADVANCE_PHASE' })} aria-label="开始投票" style={{ marginTop: 12 }}>
        开始投票
      </button>
    </div>
  )
}

