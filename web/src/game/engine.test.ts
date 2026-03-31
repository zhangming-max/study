import { describe, it, expect } from 'vitest'
import { createGame, getPhaseLabel, advancePhase } from './engine'
import type { Phase } from './types'

describe('engine', () => {
  it('creates a game with 8 players and correct role counts', () => {
    const game = createGame({ seed: 1 })
    expect(game.players).toHaveLength(8)

    const roles = game.players.map(p => p.role)
    expect(roles.filter(r => r === '狼人')).toHaveLength(2)
    expect(roles.filter(r => r === '预言家')).toHaveLength(1)
    expect(roles.filter(r => r === '女巫')).toHaveLength(1)
    expect(roles.filter(r => r === '守卫')).toHaveLength(1)
    expect(roles.filter(r => r === '平民')).toHaveLength(3)
  })

  it('phase progression day.vote -> night.guard when game not ended', () => {
    const game = createGame({ seed: 1 })
    const next = advancePhase({ game, actionPhase: 'day.vote' as Phase })
    expect(['night.guard', 'end']).toContain(next.phase)
  })

  it('phase label exists for each known phase', () => {
    const phases: Phase[] = [
      'setup',
      'reveal',
      'night.guard',
      'night.wolf',
      'night.witch',
      'night.seer',
      'day.announce',
      'day.vote',
      'end',
    ]
    for (const ph of phases) {
      expect(getPhaseLabel(ph)).toMatch(/./)
    }
  })
})

