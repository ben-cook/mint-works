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
import { Building, Plan } from "../plan.ts";

interface NeighbourhoodView {
  name: string;
  tokens: {
    number: number;
    icons: string;
  };
  plans: string;
  buildings: string;
  stars: number;
}

export class TerminalPlayer extends PlayerHelper implements IPlayer {
  constructor(name: string) {
    super(name);
  }

  async takeTurn(state: State): Promise<Turn> {
    const turns = this.generateTurns(state);

    const locationsView = state.locations.map((l) => {
      let slots = "";
      for (const slot of l.slots) {
        slots += slot.available() ? "⭕" : "⛔";
      }
      return {
        name: l.name,
        slots,
      };
    });

    let locationsText = "------------------LOCATIONS-------------------\n";

    const locationPad = 12;

    for (const location of locationsView) {
      locationsText += `|`;
      locationsText += location.name.padEnd(locationPad);
    }

    locationsText += "\n";

    for (const location of locationsView) {
      locationsText += `|`;
      if (location.slots) {
        locationsText += location.slots.padEnd(
          locationPad - location.slots.length,
        );
      } else {
        locationsText += "".padEnd(locationPad);
      }
    }
    /* const padAmount = 12;

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
    }); */
    /*
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
    }); */

    const neighbourhoods: Array<NeighbourhoodView> = state.players.map((p) => {
      let tokenIcons = "";
      for (let i = 0; i < p.tokens; i++) {
        tokenIcons += "🪙";
      }
      return {
        name: p.label,
        tokens: {
          number: p.tokens,
          icons: tokenIcons,
        },
        plans: this.formatPlanCards(p.neighbourhood.plans),
        buildings: this.formatPlanCards(p.neighbourhood.buildings),
        stars: p.neighbourhood.stars(),
      };
    });

    const textNeighbourhoods = neighbourhoods.map((n) => {
      return this.formatNeighbourhood(n);
    });

    textNeighbourhoods.forEach((n) => playerLogger.info(n));

    const textSupply = this.formatPlanCards(state.planSupply);

    const supplyText = "---------------- PLAN SUPPLY ----------------\n" +
      textSupply;

    playerLogger.info(supplyText);
    playerLogger.info(locationsText);
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

  private formatPlanCards(plans: Array<Plan>): string {
    const padAmount = 16;

    const supplyProps = plans.map((plan) => {
      let stars = "";
      for (let i = 0; i < plan.baseStars; i++) {
        stars += "⭐";
      }

      let additionalStarsText = "";

      const additionalStars = "additionalStars" in plan
        ? plan.additionalStars as Building["additionalStars"]
        : 0;

      if (additionalStars && additionalStars > 0) {
        for (let i = 0; i < additionalStars; i++) {
          additionalStarsText += "⭐";
        }
      } else if (additionalStars && additionalStars < 0) {
        additionalStarsText += "-";
        for (let i = 0; i < -additionalStars; i++) {
          additionalStarsText += "⭐";
        }
      }

      let tokens = "";
      for (let i = 0; i < plan.cost; i++) {
        tokens += "🪙";
      }

      let planTypes = "";
      if (plan.types && plan.types.length > 0) {
        for (const type of plan.types) {
          switch (type) {
            case "Culture":
              planTypes += "🌿";
              break;

            case "Deed":
              planTypes += "📋";
              break;

            case "Production":
              planTypes += "🛞";
              break;

            case "Utility":
              planTypes += "🪛";
              break;

            default:
              break;
          }
        }
      }

      return {
        name: plan.name,
        cost: tokens ?? "",
        stars,
        additionalStars: additionalStarsText ?? "",
        description: plan.description ?? "",
        type: planTypes ?? "",
      };
    });

    const supplyCards = supplyProps.map((p) => {
      let card = "--";
      for (let j = 0; j < padAmount; j++) {
        card += "-";
      }
      card += "\n";
      Object.keys(p).forEach((k) => {
        if (!card.endsWith("|")) card += "|";
        const value = p[k as keyof typeof p];

        let specificPad = padAmount;
        if (k === "stars" || k === "additionalStars") {
          specificPad = padAmount - value.length;
        } else if (k === "cost") {
          specificPad = padAmount + value.length / 2;
        }

        if (value && (value.includes("🛞") || value.includes("🪛"))) {
          specificPad = padAmount + value.length / 2;
        }

        if (!value) {
          card += "".padEnd(specificPad);
        } else if (value.length <= specificPad) {
          card += value.padEnd(specificPad);
        } else {
          const lines = value.length % 10;
          let start = 0;
          for (let i = 0; i < lines; i++) {
            card += value.substring(
              start,
              Math.min(start + specificPad, value.length - 1),
            ).padEnd(specificPad);
            start += specificPad;
            card += "|\n|";
          }
        }
        card += "|\n";
      });
      card += "--";
      for (let j = 0; j < padAmount; j++) {
        card += "-";
      }
      card += "\n";
      return card;
    });

    const splitCards = supplyCards.map((c) => {
      return c.split("\n");
    });

    let maxLength = 0;
    for (const card of splitCards) {
      if (card.length > maxLength) maxLength = card.length;
    }

    let horizontalCards = "";
    for (let i = 0; i < maxLength; i++) {
      for (const card of splitCards) {
        horizontalCards += card[i];
        horizontalCards += "  ";
      }
      horizontalCards += "\n";
    }

    return horizontalCards.trimEnd();
  }

  private formatNeighbourhood(neighbourhood: NeighbourhoodView): string {
    let textNeighbourhood =
      `---------- ${neighbourhood.name}'s Neighbourhood (${neighbourhood.tokens.number} tokens) (${neighbourhood.stars} stars) ----------\n`;

    textNeighbourhood += neighbourhood.name + " ";
    textNeighbourhood += neighbourhood.tokens.icons;

    textNeighbourhood += "\n";
    textNeighbourhood += `${neighbourhood.name}'s BUILDINGS\n`;
    textNeighbourhood += neighbourhood.buildings;
    textNeighbourhood += "\n";
    textNeighbourhood += `${neighbourhood.name}'s PLANS\n`;
    textNeighbourhood += neighbourhood.plans;

    return textNeighbourhood;
  }
}
