import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DayVoteStep from '../ui/DayVoteStep'
import { createGame } from '../game/engine'

describe('vote ui', () => {
  it('renders vote step when phase is day.vote', () => {
    const game = createGame({ seed: 1 })
    ;(game as any).phase = 'day.vote'
    const aliveSeats = game.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b)
    ;(game as any).vote = {
      voterOrder: aliveSeats,
      currentIndex: 0,
      votesByVoter: {},
      tieRetryOnceUsed: true,
    }

    render(<DayVoteStep game={game as any} onAction={() => {}} />)
    expect(screen.getByText(/白天：投票/i)).toBeInTheDocument()
  })
})

