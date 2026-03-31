import type { GameState, Action } from '../game/types'
import { useState } from 'react'

export default function NightWitchStep(props: {
  game: GameState
  onAction: (action: Action) => void
}) {
  const blocked = props.game.night.wolfWasBlockedByGuard === true
  const wolfTargetSeat = props.game.night.wolfTargetSeat

  if (blocked || typeof wolfTargetSeat !== 'number') {
    return (
      <div style={{ padding: 16 }}>
        <h1>夜晚：女巫行动</h1>
        <div style={{ marginTop: 8 }}>守卫成功，昨夜无死亡。女巫无需操作。</div>
        <button onClick={() => props.onAction({ type: 'ADVANCE_PHASE' })} aria-label="继续进入预言家">
          继续
        </button>
      </div>
    )
  }

  const aliveSeats = props.game.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b)

  const [stage, setStage] = useState<'antidote_choice' | 'antidote_select' | 'poison_choice' | 'poison_select'>(
    'antidote_choice',
  )
  const [selectedSeat, setSelectedSeat] = useState<number | undefined>(aliveSeats[0])

  const resetSelected = () => {
    setSelectedSeat(aliveSeats[0])
  }

  const renderSelectTarget = (onConfirm: () => void) => (
    <>
      <div style={{ marginTop: 12, fontWeight: 600 }}>选择目标（主持人选择）</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        {aliveSeats.map((seat) => (
          <button
            key={seat}
            aria-label={`选择座位 ${seat}`}
            onClick={() => setSelectedSeat(seat)}
            style={{ border: seat === selectedSeat ? '2px solid #2563EB' : undefined }}
          >
            座位：{seat}
          </button>
        ))}
      </div>
      <button onClick={onConfirm} aria-label="确认选择" style={{ marginTop: 12 }}>
        确认
      </button>
    </>
  )

  return (
    <div style={{ padding: 16 }}>
      <h1>夜晚：女巫行动</h1>

      {stage === 'antidote_choice' && (
        <>
          <div style={{ marginTop: 8 }}>昨夜出现死亡，女巫是否使用解药？（一次）</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <button
              onClick={() => {
                setStage('antidote_select')
                resetSelected()
              }}
              aria-label="选择使用解药"
            >
              使用解药
            </button>
            <button
              onClick={() => setStage('poison_choice')}
              aria-label="选择不使用解药"
            >
              不使用解药
            </button>
          </div>
        </>
      )}

      {stage === 'antidote_select' &&
        renderSelectTarget(() => {
          props.onAction({ type: 'WITCH_SAVE', enabled: true, targetSeat: selectedSeat })
        })}

      {stage === 'poison_choice' && (
        <>
          <div style={{ marginTop: 8 }}>是否使用毒药？（一次，若不使用则仍按狼人的击杀算死者）</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <button
              onClick={() => {
                setStage('poison_select')
                resetSelected()
              }}
              aria-label="选择使用毒药"
            >
              使用毒药
            </button>
            <button
              onClick={() => props.onAction({ type: 'WITCH_POISON_SET' })}
              aria-label="不使用毒药"
            >
              不使用毒药
            </button>
          </div>
        </>
      )}

      {stage === 'poison_select' &&
        renderSelectTarget(() => {
          props.onAction({ type: 'WITCH_POISON_SET', targetSeat: selectedSeat })
        })}
    </div>
  )
}

