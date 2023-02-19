import { Player } from "../player.ts";
import { Turn } from "../turn.ts";
import { logger } from "../logger.ts";
import { State } from "../state.ts";

export class RandomPlayer implements Player {
  name;

  constructor(name: string) {
    this.name = name;
  }

  takeTurn(state: State): Promise<Turn> {
    logger.info(`Taking a turn! State:`);
    logger.info(state);

    return new Promise((resolve, _reject) =>
      resolve({
        playerName: this.name,
        action: { _type: "Leadership" },
      })
    );
  }
}
