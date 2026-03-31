import type { GameState, Action } from '../game/types'

function getAliveSeats(game: GameState) {
  return game.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b)
}

function getCounts(game: GameState) {
  const counts = new Map<number, number>()
  const vote = game.vote
  if (!vote) return counts
  for (const voter of vote.voterOrder) {
    const t = vote.votesByVoter[voter]
    if (typeof t !== 'number') continue
    counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return counts
}

export default function DayVoteStep(props: { game: GameState; onAction: (a: Action) => void }) {
  const aliveSeats = getAliveSeats(props.game)
  const vote = props.game.vote

  if (!vote) {
    return (
      <div style={{ padding: 16 }}>
        <h1>白天：投票</h1>
        <div style={{ marginTop: 8 }}>投票准备中…</div>
      </div>
    )
  }

  const currentVoterSeat = vote.voterOrder[vote.currentIndex]
  const counts = getCounts(props.game)

  return (
    <div style={{ padding: 16 }}>
      <h1>白天：投票</h1>
      <div style={{ marginTop: 8 }}>当前投票人：座位 {currentVoterSeat ?? '-'}</div>
      <div style={{ marginTop: 8 }}>
        投票进度：{Math.min(vote.currentIndex + 1, vote.voterOrder.length)}/{vote.voterOrder.length}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        {aliveSeats.map((seat) => (
          <button
            key={seat}
            aria-label={`投票给座位 ${seat}`}
            onClick={() => {
              if (typeof currentVoterSeat !== 'number') return
              props.onAction({ type: 'DAY_VOTE', voterSeat: currentVoterSeat, targetSeat: seat })
            }}
          >
            投给：{seat}（{counts.get(seat) ?? 0}）
          </button>
        ))}
      </div>
    </div>
  )
}

