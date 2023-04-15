import { IPlayer } from "../player";
import { Turn } from "../turn";
import { playerLogger as logger } from "../logger";
import { State } from "../state";
import { PlayerHelper } from "./player_helper";
import { PlayerWithInformation } from "../mint_works";
import { HookEffect } from "../plan";

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

  async selectPlayerForEffect(
    appliedEffect: HookEffect,
    players: Array<PlayerWithInformation>,
  ): Promise<string> {
    const playerNames = players.map((p) => {
      return p.label;
    }).filter((name) => name !== this.name);
    const selectedPlayer = await playerNames.at(
      Math.floor(Math.random() * playerNames.length),
    )!;
    return selectedPlayer;
  }
}
