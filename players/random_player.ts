import { IPlayer, PlayerHelper } from "../player.ts";
import { Turn } from "../turn.ts";
import { logger } from "../logger.ts";
import { State } from "../state.ts";

export class RandomPlayer extends PlayerHelper implements IPlayer {
  constructor(name: string) {
    super(name);
  }

  takeTurn(state: State): Promise<Turn> {
    const turns = this.generateTurns(state);
    logger.info(`turns`);
    logger.info(turns);
    const turn = turns.at(Math.floor(Math.random() * turns.length))!;
    if (!turn) {
      logger.error(`Could not find a valid move!`);
    }
    return new Promise((resolve, _reject) => resolve(turn));
  }
}
