import { Player } from "../player.ts";
import { Turn } from "../turn.ts";
import { logger } from "../logger.ts";
import { State } from "../state.ts";

export class RandomPlayer implements Player {
  takeTurn(state: State): Promise<Turn> {
    logger.info(`Taking a turn! State:`);
    logger.info(state);

    return new Promise((resolve, _reject) =>
      resolve({
        playerId: 0,
        action: { _type: "Leadership" },
      })
    );
  }
}
