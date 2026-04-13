// state types
export type Player = {
  id: number;
  displayName: string;
  life: number;
  commanderDamage: Record<string, number>;
  poison: number;
  color: string; // for player color
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
  source: number; //player Id
  target: number; //target player Id (optional)
  value: number;
};
