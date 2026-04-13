type Player = {
  id: number;
  displayName: string;
  life: number;
  commanderDamage: Record<string, number>;
  color: string; // for player color
};

type gameSession = {
  id: string;
  startTime: Date;
  players: Player[];
  startingLife: string;
  gameEvents: GameEvent[];
};

type GameEvent = {
  type: "gainLife" | "loseLife" | "commander_damage";
  timestamp: Date;
  source: number & string; //player Id
  target: number & string; //target player Id (optional)
  damage: number; //damage amount (optional)
};
