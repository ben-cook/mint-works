import { IPlayer } from "../src/player";
import { Turn } from "../src/turn";
import { playerLogger, playerLogger as logger } from "../src/logger";
import { State } from "../src/state";
import { PlayerHelper } from "../src/players/player_helper";

import inquirer from "inquirer";
import { Building, HookEffect, Plan } from "../src/plan";
import { PlayerWithInformation } from "../src/mint_works";

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

  async selectPlayerForEffect(
    appliedEffect: HookEffect,
    players: Array<PlayerWithInformation>,
  ): Promise<string> {
    let textAction = "";
    switch (appliedEffect._type) {
      case "tokens":
        {
          const direction = appliedEffect.tokens > 0 ? "add" : "remove";
          const stringTokens = appliedEffect.tokens > 0
            ? appliedEffect.tokens
            : -appliedEffect.tokens;
          textAction = `to ${direction}${stringTokens} tokens to.`;
        }
        break;

      default:
        break;
    }

    const playerNames = players.map((p) => {
      return p.label;
    }).filter((name) => name !== this.name);
    const selectionPrompt = await inquirer.prompt([{
      name: "selectedPlayer",
      message: "Select a Player " + textAction,
      type: "list",
      choices: playerNames,
    }]);
    return selectionPrompt.selectedPlayer ?? playerNames[0];
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

    const neighbourhoods: Array<NeighbourhoodView> = state.players.map((p) => {
      let tokenIcons = "";
      for (let i = 0; i < p.tokens; i++) {
        tokenIcons += "⚪";
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

    const currentPlayer = state.players.find((p) => p.label === this.name)!;

    let currentPlayerTokens = "";
    for (let i = 0; i < currentPlayer.tokens; i++) {
      currentPlayerTokens += "⚪";
    }

    playerLogger.info(supplyText);
    playerLogger.info(locationsText);
    playerLogger.info(
      `${currentPlayer.label}'s Turn (${currentPlayer.neighbourhood.stars()} stars) (${currentPlayer.tokens} tokens) ${currentPlayerTokens}`,
    );

    const userTurns = turns.map((turn) => {
      const actionName = turn.action._type;
      const plan = "plan" in turn.action ? turn.action.plan : undefined;
      let text = `${actionName}`;
      if (plan) {
        if (actionName === "Supply") {
          text += ` - ${plan.name} (${plan.cost} tokens)`;
        } else if (actionName === "Build") {
          const crane = currentPlayer.neighbourhood.getBuilding("Crane");
          let buildCost = 2;
          if (crane) buildCost -= 1;
          text += ` - ${plan.name} (${buildCost} tokens)`;
        }
        // TODO: Add location cost
      }
      return text;
    });

    const choice = await inquirer.prompt([{
      name: "turn",
      message: "Select a Turn Option",
      type: "list",
      choices: userTurns,
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
    const padAmount = 20;

    const supplyProps = plans.map((plan) => {
      let stars = "";
      for (let i = 0; i < plan.baseStars; i++) {
        stars += "⭐";
      }

      let additionalStarsText = "";

      const additionalStars = "additionalStars" in plan
        ? plan.additionalStars as Building["additionalStars"]
        : 0;

      if (additionalStars) {
        if (additionalStars > 0) {
          for (let i = 0; i < additionalStars; i++) {
            additionalStarsText += "⭐";
          }
        } else if (additionalStars < 0) {
          additionalStarsText += "-";
          for (let i = 0; i < -additionalStars; i++) {
            additionalStarsText += "⭐";
          }
        }
      }

      let tokens = "";
      for (let i = 0; i < plan.cost; i++) {
        tokens += "⚪";
      }

      let descriptions = "";
      if (plan.description) {
        descriptions = this.formatText(plan.description);
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
              planTypes += "🔨";
              break;

            case "Utility":
              planTypes += "💡";
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
        description: descriptions,
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
          if (value && value.includes("-")) specificPad += 1;
        } else if (k === "cost") {
          specificPad = padAmount - value.length;
        }

        if (!value) {
          card += "".padEnd(specificPad);
        } else if (k === "description" || value.length > specificPad) {
          let currentLine = "";

          let emojiCount = 0;

          for (let i = 0; i < value.length; i++) {
            let currentEmoji = false;
            if (value[i] === "⚪" || value[i] === "🌿" || value[i] === "⭐") {
              emojiCount += 1;
              currentEmoji = true;
            }

            if (currentLine.length + 1 + emojiCount > padAmount) {
              if (currentEmoji) {
                emojiCount = 1;
                card += currentLine.padEnd(padAmount);
              } else {
                card += currentLine.padEnd(padAmount - emojiCount);
                emojiCount = 0;
              }
              currentLine = "";
              card += "|\n|";
            }

            currentLine += value[i];
          }

          // Add the last line to the result array
          if (currentLine.length > 0) {
            card += currentLine.padEnd(padAmount - emojiCount);
          }
        } else if (value.length <= specificPad) {
          card += value.padEnd(specificPad);
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
        let line = card[i];
        if (!line) line = "".padEnd(padAmount + 2);
        horizontalCards += line;
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

  private formatText(text: string) {
    text = text.replaceAll(":TOKEN:", "⚪");
    text = text.replaceAll(":CULTURE:", "🌿");
    text = text.replaceAll(":STAR:", "⭐");
    return text;
  }
}