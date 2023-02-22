import { IPlayer } from "../player.ts";
import { Turn } from "../turn.ts";
import { playerLogger as logger } from "../logger.ts";
import { State } from "../state.ts";
import { PlayerHelper } from "./player_helper.ts";

import {
  Checkbox,
  Confirm,
  Input,
  Number,
  prompt,
  Select,
} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";

export class TerminalPlayer extends PlayerHelper implements IPlayer {
  constructor(name: string) {
    super(name);
  }

  async takeTurn(state: State): Promise<Turn> {
    const turns = this.generateTurns(state);
    logger.info(`[${this.name}] available turns: ${JSON.stringify(turns)}`);

    const userTurns = turns.map((turn) => {
      return JSON.stringify(turn);
    });

    const choice = await prompt([{
      name: "turn",
      message: "Select a Turn Option",
      type: Select,
      options: userTurns,
    }]);

    if (!choice.turn) throw new Error("No turn selected");

    const turn = turns.find((turn) => {
      return JSON.stringify(turn) === choice.turn;
    })!;
    logger.info(`[${this.name}] chosen turn: ${JSON.stringify(turn)}`);
    if (!turn) {
      logger.error(`Could not find a valid move!`);
    }
    return new Promise((resolve, _reject) => resolve(turn));
  }
}
