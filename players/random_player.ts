import { Player } from "../player.ts";
import { Turn } from "../turn.ts";
import { logger } from "../logger.ts";

export class RandomPlayer implements Player {
  async takeTurn(): Promise<Turn> {
    logger.info(`Taking a turn!`);
    return {
      playerId: 0,
      action: { _type: "Leadership" },
    };
  }
}
