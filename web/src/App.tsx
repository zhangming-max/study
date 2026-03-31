import './styles/global.css'
import { useState } from 'react'
import { applyAction, createGame } from './game/engine'
import StartScreen from './ui/StartScreen'
import RevealScreen from './ui/RevealScreen'
import NightGuardStep from './ui/NightGuardStep'
import NightWolfStep from './ui/NightWolfStep'
import NightWitchStep from './ui/NightWitchStep'
import NightSeerStep from './ui/NightSeerStep'
import DayAnnounceStep from './ui/DayAnnounceStep'
import DayVoteStep from './ui/DayVoteStep'
import EndScreen from './ui/EndScreen'

export default function App() {
  const [game, setGame] = useState(() => createGame({ seed: 1 }))

  const dispatch = (action: Parameters<typeof applyAction>[0]['action']) => {
    setGame((prev) => applyAction({ game: prev, action }))
  }

  const phase = game.phase

  if (phase === 'end') {
    return <EndScreen game={game} onRestart={() => setGame(createGame({ seed: 1 }))} />
  }

  // 当前阶段直接映射到对应 UI。
  switch (phase) {
    case 'reveal':
      return <RevealScreen game={game} onAdvance={() => dispatch({ type: 'ADVANCE_PHASE' })} />
    case 'night.guard':
      return <NightGuardStep game={game} onAction={(a) => dispatch(a)} />
    case 'night.wolf':
      return <NightWolfStep game={game} onAction={(a) => dispatch(a)} />
    case 'night.witch':
      return <NightWitchStep game={game} onAction={(a) => dispatch(a)} />
    case 'night.seer':
      return <NightSeerStep game={game} onAction={(a) => dispatch(a)} />
    case 'day.announce':
      return <DayAnnounceStep game={game} onAction={(a) => dispatch(a)} />
    case 'day.vote':
      return <DayVoteStep game={game} onAction={(a) => dispatch(a)} />
    default:
      return <StartScreen onStart={() => setGame(createGame({ seed: 1 }))} />
  }
}
