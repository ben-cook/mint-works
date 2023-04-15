import { MintWorksParams, PlayerWithInformation } from "../src/mint_works";
import { Neighbourhood } from "../src/neighbourhood";
import { TerminalPlayer } from "./terminal_player";

import inquirer from "inquirer";
import { createPlans } from "../src/plans";
import { Plan } from "../src/plan";
import { customAssets } from "../src/custom/custom";

type TerminalGames = "Quick" | "Standard" | "Custom";

const terminalGames = ["Quick", "Standard", "Custom"] satisfies Array<TerminalGames>;

interface TerminalGameSettings {
  startingTokens?: number;
  deck?: Array<Plan>;
}

/**
 *
 */
export async function createTerminalGame({
  numberOfPlayers,
}: {
  numberOfPlayers: number;
}): Promise<MintWorksParams> {
  const gameChoice = await inquirer.prompt([
    {
      name: "choice",
      message: "Select a Game Type",
      type: "list",
      choices: terminalGames,
    },
  ]);

  if (!gameChoice.choice) throw new Error("No game type selected");

  const gameType = gameChoice.choice as TerminalGames;

  let gameSettings = {} as TerminalGameSettings;
  switch (gameType) {
    case "Custom":
      gameSettings = await createCustomGame();
      break;

    default:
      break;
  }

  const { startingTokens, deck } = gameSettings;

  const players = await createTerminalPlayers({
    gameType,
    numberOfPlayers,
    startingTokens,
  });

  const gameParams: MintWorksParams = { players, deck };

  return gameParams;
}

/**
 *
 */
async function createCustomGame(): Promise<TerminalGameSettings> {
  const customSettings = await inquirer.prompt([
    {
      name: "startingTokens",
      message: "Starting Tokens",
      type: "number",
      default: 3,
    },
    {
      name: "customDecks",
      message: "Expansion Decks",
      type: "checkbox",
      options: ["Base Deck", "Deeds Only"].concat(
        customAssets.decks.map((d) => {
          return d.name;
        })
      ),
    },
    {
      name: "topCard",
      message: "Card at top of deck",
      type: "input",
      /**
       *
       */
      validate: (value: string) => {
        const plans = createPlans();
        if (plans.find((p) => p.name.toLowerCase().trim() === value.toLowerCase().trim())) {
          return true;
        }
        return `${value} NOT FOUND!`;
      },
    },
  ]);

  /* const customDecks = []
  if (customSettings.customDecks && customSettings.customDecks.length > 0) {
    for (const deck of customSettings.customDecks) {
      const deckPlans = await prompt([{
        name: "plans",
        message: `Select plans for ${deck}`,
        type: Checkbox,
        options: [],
      }]);

      customDecks.push(deckPlans.plans);
    }
  } */

  const plans = createPlans();

  let customDecks: Array<Array<Plan>> = [];
  const deck: Array<Plan> = [];
  if (customSettings.customDecks && customSettings.customDecks.length > 0) {
    customDecks = customAssets.decks
      .filter((d) => customSettings.customDecks?.includes(d.name))
      .map((d) => {
        return d.asset;
      });
    if (customSettings.customDecks.includes("Base Deck")) {
      const baseDeck = plans.slice();
      customDecks.push(baseDeck);
    } else if (customSettings.customDecks.includes("Deeds Only")) {
      const deedsOnly = plans.filter((p) => p.types.includes("Deed"));
      customDecks.push(deedsOnly);
    }
  }

  customDecks.forEach((d) => {
    deck.push(...d);
  });

  const finalDeck = deck.slice().filter((p) => {
    return p.name.toLowerCase().trim() !== customSettings.topCard;
  });

  const foundPlan = plans.find((p) => p.name.toLowerCase().trim() === customSettings.topCard)!;

  finalDeck.push(foundPlan);

  return { startingTokens: customSettings.startingTokens, deck: finalDeck };
}

/**
 *
 */
async function createTerminalPlayers({
  gameType,
  numberOfPlayers,
  startingTokens,
}: {
  gameType: TerminalGames;
  numberOfPlayers: number;
  startingTokens?: number;
}): Promise<Array<PlayerWithInformation>> {
  switch (gameType) {
    case "Standard":
    case "Custom": {
      const players = [];
      for (let i = 0; i < numberOfPlayers; i++) {
        const player = await inquirer.prompt([
          {
            name: "name",
            message: "Player Name",
            type: "input",
            /**
             *
             */
            validate: (value: string) => {
              if (!value || value.length < 1) return false;
              return true;
            },
          },
          {
            name: "age",
            message: "Age",
            type: "input",
            /**
             *
             */
            validate: (value: string) => {
              if (parseInt(value) < 0) return false;
              return true;
            },
          },
        ]);

        if (!player.name || !player.age) {
          throw new Error("No player name or age selected");
        }

        players.push({
          player: new TerminalPlayer(player.name),
          tokens: startingTokens ?? 3,
          label: player.name,
          age: parseInt(player.age),
          neighbourhood: new Neighbourhood(),
        });
      }
      return players;
    }

    case "Quick":
    default: {
      const players = [];
      for (let i = 0; i < numberOfPlayers; i++) {
        players.push({
          player: new TerminalPlayer(`Player ${i + 1}`),
          tokens: startingTokens ?? 3,
          label: `Player ${i + 1}`,
          age: 42,
          neighbourhood: new Neighbourhood(),
        });
      }
      return players;
    }
  }
}
