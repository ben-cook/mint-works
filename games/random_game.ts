import { MintWorksParams, PlayerWithInformation } from "../mint_works.ts";
import { Neighbourhood } from "../neighbourhood.ts";
import { RandomPlayer } from "../players/random_player.ts";

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
  const players = [];
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
