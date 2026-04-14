// all game types and logic live here — one file for the full data model and state machine.

export type Player = {
  id: number;
  displayName: string;
  life: number;
  commanderDamage: Record<string, number>;
  poison: number;
  color: string;
};

export type GameSession = {
  id: string;
  startTime: Date;
  players: Player[];
  startingLife: number;
  gameEvents: GameEvent[];
};

export type GameEvent = {
  type: "gainLife" | "loseLife" | "commander_damage";
  timestamp: Date;
  // the player who caused the event
  source: number;
  // the player who receives the effect
  target: number;
  value: number;
};

// every possible state change is described as one of these action objects.
export type Action =
  | { type: "ADJUST_LIFE"; playerId: number; delta: number }
  | { type: "ADJUST_POISON"; playerId: number; delta: number }
  | { type: "ADJUST_COMMANDER_DAMAGE"; playerId: number; sourceId: number; delta: number }
  | { type: "RESET_GAME" }
  | { type: "NEW_SESSION"; session: GameSession };

const PLAYER_COLORS = ["red", "blue", "green", "white", "black"];

// builds a fresh GameSession from a list of player names and a starting life total.
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

// takes the current session and an action, returns a new session with the change applied.
// this is a pure function — it never mutates the existing state, always returns a new object.
export function gameReducer(state: GameSession, action: Action): GameSession {
  switch (action.type) {
    case "ADJUST_LIFE": {
      // record the event, then update the target player's life total.
      const event: GameEvent = {
        type: action.delta >= 0 ? "gainLife" : "loseLife",
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

    case "ADJUST_POISON":
      // poison counters kill a player at 10; tracked separately from life.
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.playerId ? { ...p, poison: p.poison + action.delta } : p
        ),
      };

    case "ADJUST_COMMANDER_DAMAGE": {
      // commander damage also drains life and is tracked per attacker (sourceId).
      const event: GameEvent = {
        type: "commander_damage",
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

    case "RESET_GAME":
      // restart with the same players and starting life, clearing all events.
      return createSession(
        state.players.map(p => p.displayName),
        state.startingLife,
      );

    case "NEW_SESSION":
      // replace the entire session with a new one (used when the server sends a fresh state).
      return action.session;

    default:
      return state;
  }
}
