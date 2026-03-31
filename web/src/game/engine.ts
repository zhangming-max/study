import type { Action, GameState, NightState, Phase, Player, Role, Settings } from './types'

const rolePack: Role[] = ['狼人', '狼人', '预言家', '女巫', '守卫', '平民', '平民', '平民']

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(arr: T[], seed: number) {
  const rand = mulberry32(seed)
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getPhaseLabel(phase: Phase) {
  switch (phase) {
    case 'setup':
      return '开始'
    case 'reveal':
      return '身份查看'
    case 'night.guard':
      return '夜晚：守卫行动'
    case 'night.wolf':
      return '夜晚：狼人行动'
    case 'night.witch':
      return '夜晚：女巫行动'
    case 'night.seer':
      return '夜晚：预言家行动'
    case 'day.announce':
      return '白天：公布死亡'
    case 'day.vote':
      return '白天：投票'
    case 'end':
      return '结算'
  }
}

export function createGame(params: { seed: number }): GameState {
  const shuffledRoles = shuffle(rolePack, params.seed)
  const players: Player[] = shuffledRoles.map((role, idx) => ({
    seat: idx + 1,
    role,
    alive: true,
  }))

  const settings: Settings = {
    tieVoteRetryOnce: false,
  }

  const night: NightState = {}

  return {
    players,
    turn: 1,
    phase: 'reveal',
    phaseIndex: 0,
    night,
    history: [],
    settings,
    revealProgress: 0,
  }
}

export function advancePhase(args: { game: GameState; actionPhase: Phase }): GameState {
  const { game } = args
  const next: GameState = structuredClone(game)

  // Resolve "day.announce" effects (apply night death) before checking win conditions.
  if (args.actionPhase === 'day.announce') {
    const finalDeathSeat = next.night.finalDeathSeat
    if (typeof finalDeathSeat === 'number') {
      const victim = next.players.find(p => p.seat === finalDeathSeat)
      if (victim) victim.alive = false
    }
    next.history.push({
      turn: next.turn,
      type: 'day_announce',
      payload: { finalDeathSeat: next.night.finalDeathSeat ?? null },
    })
    next.night.finalDeathSeat = undefined
  }

  const phaseOrder: Phase[] = [
    'reveal',
    'night.guard',
    'night.wolf',
    'night.witch',
    'night.seer',
    'day.announce',
    'day.vote',
  ]
  const idx = phaseOrder.indexOf(args.actionPhase)
  if (idx === -1) return next

  const nextPhase = phaseOrder[idx + 1] ?? 'night.guard'
  next.phase = nextPhase

  // Initialize vote state when entering day.vote (after deaths are applied).
  if (nextPhase === 'day.vote') {
    const aliveSeats = next.players.filter(p => p.alive).map(p => p.seat).sort((a, b) => a - b)
    next.vote = {
      voterOrder: aliveSeats,
      currentIndex: 0,
      votesByVoter: {},
      tieRetryOnceUsed: next.settings.tieVoteRetryOnce ? false : true,
    }
  }

  // If entering night.guard, it can be either "first night" (from reveal) or "next round" (from day.vote).
  if (nextPhase === 'night.guard') {
    next.phaseIndex = 0
    next.night = {}
    if (args.actionPhase === 'day.vote') {
      next.turn += 1
    }
  }

  // Check victory conditions after applying any phase effects above.
  const alive = next.players.filter(p => p.alive)
  const wolfAlive = alive.filter(p => p.role === '狼人').length
  const goodAlive = alive.filter(p => p.role !== '狼人').length
  const wolvesEliminated = wolfAlive === 0
  const wolvesDominates = wolfAlive >= goodAlive && wolfAlive > 0

  if (wolvesEliminated || wolvesDominates) {
    next.phase = 'end'
    next.history.push({
      turn: next.turn,
      type: 'end',
      payload: { wolfAlive, goodAlive, wolvesEliminated, wolvesDominates },
    })
  }

  return next
}

function checkWin(game: GameState) {
  const alive = game.players.filter(p => p.alive)
  const wolfAlive = alive.filter(p => p.role === '狼人').length
  const goodAlive = alive.filter(p => p.role !== '狼人').length
  const wolvesEliminated = wolfAlive === 0
  const wolvesDominates = wolfAlive >= goodAlive && wolfAlive > 0
  return { wolfAlive, goodAlive, wolvesEliminated, wolvesDominates }
}

export function applyAction(args: { game: GameState; action: Action }): GameState {
  const { game, action } = args
  const next: GameState = structuredClone(game)

  switch (action.type) {
    case 'GUARD_SET': {
      if (next.phase !== 'night.guard') return next
      next.night.guardTargetSeat = action.targetSeat
      next.history.push({
        turn: next.turn,
        type: 'night_guard',
        payload: { guardTargetSeat: action.targetSeat ?? null },
      })
      next.phase = 'night.wolf'
      next.night.wolfWasBlockedByGuard = false
      return next
    }

    case 'WOLF_SET': {
      if (next.phase !== 'night.wolf') return next
      next.night.wolfTargetSeat = action.targetSeat
      const blocked = typeof action.targetSeat === 'number' && next.night.guardTargetSeat === action.targetSeat
      next.night.wolfWasBlockedByGuard = blocked
      next.history.push({
        turn: next.turn,
        type: 'night_wolf',
        payload: { wolfTargetSeat: action.targetSeat ?? null, blocked },
      })
      next.phase = 'night.witch'
      // Reset final resolution; will be decided in witch step.
      next.night.finalDeathSeat = undefined
      return next
    }

    case 'WITCH_SAVE': {
      if (next.phase !== 'night.witch') return next
      const enabled = action.enabled
      if (!enabled) {
        next.night.witchSaved = false
        return next
      }

      // Using antidote cancels the wolf death.
      next.night.witchSaved = true
      next.night.witchPoisonTargetSeat = undefined
      next.night.finalDeathSeat = undefined
      next.history.push({
        turn: next.turn,
        type: 'night_witch',
        payload: { witchSaved: true, targetSeat: action.targetSeat ?? null },
      })
      next.phase = 'night.seer'
      return next
    }

    case 'WITCH_POISON_SET': {
      if (next.phase !== 'night.witch') return next
      const targetSeat = action.targetSeat
      const wolfTargetSeat = next.night.wolfTargetSeat
      const blocked = next.night.wolfWasBlockedByGuard === true

      if (blocked) {
        next.night.finalDeathSeat = undefined
      } else {
        if (typeof targetSeat === 'number') {
          next.night.witchPoisonTargetSeat = targetSeat
          next.night.finalDeathSeat = targetSeat
        } else {
          // Neither antidote nor poison used.
          next.night.finalDeathSeat = wolfTargetSeat
        }
      }

      next.history.push({
        turn: next.turn,
        type: 'night_witch',
        payload: { witchSaved: next.night.witchSaved ?? false, witchPoisonTargetSeat: targetSeat ?? null },
      })
      next.phase = 'night.seer'
      return next
    }

    case 'SEER_CHECK': {
      if (next.phase !== 'night.seer') return next
      next.night.seerTargetSeat = action.targetSeat
      const target = next.players.find(p => p.seat === action.targetSeat)
      const seerResult = target?.role === '狼人' ? '狼人' : '好人'
      next.night.seerResult = seerResult
      next.history.push({
        turn: next.turn,
        type: 'night_seer',
        payload: { seerTargetSeat: action.targetSeat, seerResult },
      })
      return next
    }

    case 'ADVANCE_PHASE': {
      return advancePhase({ game: next, actionPhase: next.phase })
    }

    case 'DAY_VOTE': {
      if (next.phase !== 'day.vote') return next
      if (!next.vote) return next

      const { voterSeat, targetSeat } = action
      // Record vote; validation is handled lightly for speed.
      next.vote.votesByVoter[voterSeat] = targetSeat

      const order = next.vote.voterOrder
      const nextIndex = next.vote.currentIndex + 1
      next.vote.currentIndex = nextIndex

      // Finished when currentIndex points past the last voter.
      if (next.vote.currentIndex >= order.length) {
        const counts = new Map<number, number>()
        for (const voter of order) {
          const t = next.vote.votesByVoter[voter]
          if (typeof t !== 'number') continue
          counts.set(t, (counts.get(t) ?? 0) + 1)
        }
        let maxVotes = -1
        let topSeats: number[] = []
        for (const [seat, c] of counts.entries()) {
          if (c > maxVotes) {
            maxVotes = c
            topSeats = [seat]
          } else if (c === maxVotes) {
            topSeats.push(seat)
          }
        }
        topSeats = topSeats.sort((a, b) => a - b)
        const isTie = topSeats.length !== 1

        let eliminatedSeat: number | null = null
        if (!isTie) eliminatedSeat = topSeats[0]

        next.history.push({
          turn: next.turn,
          type: 'day_vote',
          payload: { votes: next.vote.votesByVoter, maxVotes, eliminatedSeat, isTie },
        })

        if (eliminatedSeat !== null) {
          const p = next.players.find(pp => pp.seat === eliminatedSeat)
          if (p) p.alive = false
        } else {
          // Tie: no one eliminated (default).
          // If you later add retry-once, implement it here.
        }

        const win = checkWin(next)
        if (win.wolvesEliminated || win.wolvesDominates) {
          next.phase = 'end'
          next.history.push({
            turn: next.turn,
            type: 'end',
            payload: { wolfAlive: win.wolfAlive, goodAlive: win.goodAlive, wolvesEliminated: win.wolvesEliminated, wolvesDominates: win.wolvesDominates },
          })
          return next
        }

        // Start next night round
        next.phase = 'night.guard'
        next.phaseIndex = 0
        next.night = {}
        next.turn += 1
        next.vote = undefined
      }

      return next
    }

    default:
      return next
  }
}

