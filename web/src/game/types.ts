export type Role = '狼人' | '预言家' | '女巫' | '守卫' | '平民'

export type Phase =
  | 'setup'
  | 'reveal'
  | 'night.guard'
  | 'night.wolf'
  | 'night.witch'
  | 'night.seer'
  | 'day.announce'
  | 'day.vote'
  | 'end'

export type Player = {
  seat: number // 1..8
  role: Role
  alive: boolean
  voteSeat?: number
}

export type NightState = {
  guardTargetSeat?: number
  wolfTargetSeat?: number
  witchSaved?: boolean
  witchPoisonTargetSeat?: number
  seerTargetSeat?: number
  seerResult?: '狼人' | '好人'
  wolfWasBlockedByGuard?: boolean
  // night action resolves into one final death seat (or undefined for no death)
  finalDeathSeat?: number
}

export type Settings = {
  tieVoteRetryOnce: boolean
}

export type HistoryEvent = {
  turn: number
  type:
    | 'reveal'
    | 'night_guard'
    | 'night_wolf'
    | 'night_witch'
    | 'night_seer'
    | 'day_announce'
    | 'day_vote'
    | 'end'
  payload: Record<string, unknown>
}

export type GameState = {
  players: Player[]
  turn: number
  phase: Phase
  phaseIndex: number
  night: NightState
  history: HistoryEvent[]
  settings: Settings
  revealProgress: number // 0..8 (currently UI may manage separately)

  vote?: {
    voterOrder: number[]
    currentIndex: number
    // votesByVoter maps voterSeat -> targetSeat
    votesByVoter: Record<number, number>
    tieRetryOnceUsed: boolean
  }
}

export type Action =
  | { type: 'GUARD_SET'; targetSeat?: number }
  | { type: 'WOLF_SET'; targetSeat?: number }
  | { type: 'WITCH_SAVE'; enabled: boolean; targetSeat?: number }
  | { type: 'WITCH_POISON_SET'; targetSeat?: number }
  | { type: 'SEER_CHECK'; targetSeat: number }
  | { type: 'DAY_VOTE'; voterSeat: number; targetSeat: number }
  | { type: 'ADVANCE_PHASE' }


