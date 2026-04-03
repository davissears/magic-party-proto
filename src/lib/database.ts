// game_value; value = id
const GAME_ABCD = {
  player0Life: 20,
  player1Life: 20,
  player2Life: 20,
  player3Life: 20,
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
