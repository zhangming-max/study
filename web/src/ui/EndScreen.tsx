import type { GameState } from '../game/types'

function getWinner(game: GameState) {
  const alive = game.players.filter(p => p.alive)
  const wolfAlive = alive.filter(p => p.role === '狼人').length
  const goodAlive = alive.filter(p => p.role !== '狼人').length

  if (wolfAlive === 0) return '好人胜'
  if (wolfAlive >= goodAlive) return '狼人胜'
  return '好人胜'
}

export default function EndScreen(props: { game: GameState; onRestart: () => void }) {
  const winner = getWinner(props.game)
  return (
    <div style={{ padding: 16 }}>
      <h1>结算</h1>
      <div style={{ marginTop: 8, fontWeight: 700 }}>胜利方：{winner}</div>
      <button onClick={props.onRestart} aria-label="开始新局" style={{ marginTop: 12 }}>
        开始新局
      </button>
    </div>
  )
}

