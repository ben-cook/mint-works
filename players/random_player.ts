import { IPlayer } from "../player.ts";
import { Turn } from "../turn.ts";
import { playerLogger as logger } from "../logger.ts";
import { State } from "../state.ts";
import { PlayerHelper } from "./player_helper.ts";

export class RandomPlayer extends PlayerHelper implements IPlayer {
  constructor(name: string) {
    super(name);
  }

  takeTurn(state: State): Promise<Turn> {
    const turns = this.generateTurns(state);
    logger.info(`[${this.name}] available turns: ${JSON.stringify(turns)}`);
    const turn = turns.at(Math.floor(Math.random() * turns.length))!;
    logger.info(`[${this.name}] chosen turn: ${JSON.stringify(turn)}`);
    if (!turn) {
      logger.error(`Could not find a valid move!`);
    }
    return new Promise((resolve, _reject) => resolve(turn));
  }
}
