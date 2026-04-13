import { GameSession, GameEvent } from "./state";

const PLAYER_COLORS = ["red", "blue", "green", "white", "black"];

export type Action =
  | { type: 'ADJUST_LIFE'; playerId: number; delta: number }
  | { type: 'ADJUST_POISON'; playerId: number; delta: number }
  | { type: 'ADJUST_COMMANDER_DAMAGE'; playerId: number; sourceId: number; delta: number }
  | { type: 'RESET_GAME' }
  | { type: 'NEW_SESSION'; session: GameSession };

export function createSession(
  playerNames: string[],
  startingLife: GameSession["startingLife"],
): GameSession {
  return {
    id: crypto.randomUUID(),
    startTime: new Date(),
    startingLife,
    gameEvents: [],
    players: playerNames.map((name, i) => ({
      id: i,
      displayName: name,
      life: startingLife,
      poison: 0,
      commanderDamage: {},
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
    })),
  };
}

export function gameReducer(state: GameSession, action: Action): GameSession {
  switch (action.type) {
    case 'ADJUST_LIFE': {
      const event: GameEvent = {
        type: action.delta >= 0 ? 'gainLife' : 'loseLife',
        timestamp: new Date(),
        source: action.playerId,
        target: action.playerId,
        value: action.delta,
      };
      return {
        ...state,
        gameEvents: [...state.gameEvents, event],
        players: state.players.map(p =>
          p.id === action.playerId ? { ...p, life: p.life + action.delta } : p
        ),
      };
    }

    case 'ADJUST_POISON':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId ? { ...p, poison: p.poison + action.delta } : p
        ),
      };

    case 'ADJUST_COMMANDER_DAMAGE': {
      const event: GameEvent = {
        type: 'commander_damage',
        timestamp: new Date(),
        source: action.sourceId,
        target: action.playerId,
        value: action.delta,
      };
      return {
        ...state,
        gameEvents: [...state.gameEvents, event],
        players: state.players.map(p => {
          if (p.id !== action.playerId) return p;
          const prev = p.commanderDamage[action.sourceId] ?? 0;
          return {
            ...p,
            life: p.life - action.delta,
            commanderDamage: { ...p.commanderDamage, [action.sourceId]: prev + action.delta },
          };
        }),
      };
    }

    case 'RESET_GAME':
      return createSession(
        state.players.map(p => p.displayName),
        state.startingLife,
      );

    case 'NEW_SESSION':
      return action.session;

    default:
      return state;
  }
}
