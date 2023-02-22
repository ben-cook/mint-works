import { IPlayer } from "../player.ts";
import { Turn } from "../turn.ts";
import { playerLogger, playerLogger as logger } from "../logger.ts";
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

    playerLogger.info(state.locations);

    const padAmount = 12;

    state.players.forEach((p, i) => {
      const buildings = p.neighbourhood.buildings;
      const plans = p.neighbourhood.plans;

      let outputText = `${i} -- ${p.label} -- (${p.tokens} tokens)`;

      let buildingText = "----------BUILDINGS----------";
      buildingText += "\n NAME".padEnd(padAmount);

      buildings.forEach((b) => {
        buildingText += b.name?.padEnd(padAmount);
      });

      buildingText += "\n STARS".padEnd(padAmount);

      buildings.forEach((b) => {
        buildingText += b.baseStars?.toString().padEnd(padAmount);
      });

      buildingText += "\n ADD STARS".padEnd(padAmount);

      buildings.forEach((b) => {
        buildingText += b.additionalStars?.toString().padEnd(padAmount);
      });

      let planText = "------------PLANS------------";
      planText += "\n NAME".padEnd(padAmount);

      plans.forEach((b) => {
        planText += b.name?.padEnd(padAmount);
      });

      buildingText += "\n STARS".padEnd(padAmount);

      plans.forEach((b) => {
        planText += b.baseStars?.toString().padEnd(padAmount);
      });
      outputText += "\n";

      outputText += buildingText;
      outputText += "\n";

      outputText += planText;

      playerLogger.info(outputText + "\n \n");
    });

    let supplyText = "------------------PLAN SUPPLY------------------";

    const supplyPad = 22;

    supplyText += "\n NAME".padEnd(supplyPad);

    state.planSupply.forEach((b) => {
      supplyText += b.name?.padEnd(supplyPad);
    });

    supplyText += "\n STARS".padEnd(supplyPad);

    state.planSupply.forEach((b) => {
      supplyText += b.baseStars?.toString().padEnd(supplyPad);
    });

    supplyText += "\n COST".padEnd(supplyPad);

    state.planSupply.forEach((b) => {
      supplyText += b.cost?.toString().padEnd(supplyPad);
    });

    supplyText += "\n UPKEEP".padEnd(supplyPad);

    state.planSupply.forEach((b) => {
      const upHook = b.hooks?.upkeep;
      supplyText += upHook
        ? JSON.stringify(upHook).padEnd(supplyPad)
        : "".padEnd(supplyPad);
    });

    playerLogger.info(supplyText);
    playerLogger.info(this.name + "'s Turn");

    const userTurns = turns.map((turn) => {
      const actionName = turn.action._type;
      const plan = "plan" in turn.action ? turn.action.plan : undefined;
      let text = `${actionName}`;
      if (plan) text += ` - ${plan.name} (${plan.cost} tokens)`;
      return text;
    });

    const choice = await prompt([{
      name: "turn",
      message: "Select a Turn Option",
      type: Select,
      options: userTurns,
    }]);

    if (!choice.turn) throw new Error("No turn selected");

    const turnIndex = userTurns.findIndex((t) => t === choice.turn);
    const turn = turns[turnIndex];

    logger.info(`[${this.name}] chosen turn: ${JSON.stringify(turn)}`);
    if (!turn) {
      logger.error(`Could not find a valid move!`);
    }
    return new Promise((resolve, _reject) => resolve(turn));
  }
}
