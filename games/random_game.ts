import { MintWorksParams, PlayerWithInformation } from "../src/mint_works";
import { Neighbourhood } from "../src/neighbourhood";
import { RandomPlayer } from "../src/players/random_player";

export function createRandomGame(
  { numberOfPlayers }: { numberOfPlayers: number },
): MintWorksParams {
  const players = createRandomPlayers({
    numberOfPlayers,
  });

  const gameParams: MintWorksParams = { players };

  return gameParams;
}

function createRandomPlayers(
  { numberOfPlayers }: { numberOfPlayers: number },
): Array<PlayerWithInformation> {
  const players: Array<PlayerWithInformation> = [];
  for (let i = 0; i < numberOfPlayers; i++) {
    players.push({
      player: new RandomPlayer(`Player ${i + 1}`),
      tokens: 3,
      label: `Player ${i + 1}`,
      age: 42,
      neighbourhood: new Neighbourhood(),
    });
  }
  return players;
}
