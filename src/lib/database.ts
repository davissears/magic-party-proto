// game_value; value = id
const GAME_ABCD = {
  player0Life: 40,
  player1Life: 40,
  player2Life: 40,
  player3Life: 40,
};
//
export type TPlayerNumber = 0 | 1 | 2 | 3;

export function getPlayerLife(gameId: string, playerNumber: TPlayerNumber) {
  return GAME_ABCD[`player${playerNumber}Life`];
}

export function decrementPlayerLife(
  gameId: string,
  playerIndex: TPlayerNumber,
) {
  GAME_ABCD[`player${playerIndex}Life`]--;
}
