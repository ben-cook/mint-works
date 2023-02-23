import { MintWorksParams, PlayerWithInformation } from "../mint_works.ts";
import { Neighbourhood } from "../neighbourhood.ts";
import { TerminalPlayer } from "../players/terminal_player.ts";

import {
  Checkbox,
  Confirm,
  Input,
  Number,
  prompt,
  Select,
} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import { createPlans } from "../plans.ts";

type TerminalGames = "Quick" | "Standard" | "Custom";

const terminalGames = [
  "Quick",
  "Standard",
  "Custom",
] satisfies Array<TerminalGames>;

interface TerminalGameSettings {
  startingTokens?: number;
}

export async function createTerminalGame(
  { numberOfPlayers }: { numberOfPlayers: number },
): Promise<MintWorksParams> {
  const gameChoice = await prompt([{
    name: "choice",
    message: "Select a Game Type",
    type: Select,
    options: terminalGames,
  }]);

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

  const { startingTokens } = gameSettings;

  const players = await createTerminalPlayers({
    gameType,
    numberOfPlayers,
    startingTokens,
  });

  const gameParams: MintWorksParams = { players };

  return gameParams;
}

async function createCustomGame(): Promise<TerminalGameSettings> {
  const customSettingsToUse = await prompt([
    {
      name: "customSettings",
      message: "Which settings do you wish to customise?",
      type: Checkbox,
      options: [],
    },
  ]);

  const customSettings = await prompt([{
    name: "startingTokens",
    message: "Starting Tokens",
    type: Number,
    default: 3,
  }, {
    name: "topCard",
    message: "Card at top of deck",
    type: Input,
    validate: (value: string) => {
      const plans = createPlans();
      if (
        plans.find((p) =>
          p.name.toLowerCase().trim() === value.toLowerCase().trim()
        )
      ) {
        return true;
      }
      return `${value} NOT FOUND!`;
    },
  }]);
  return { startingTokens: customSettings.startingTokens };
}

async function createTerminalPlayers(
  { gameType, numberOfPlayers, startingTokens }: {
    gameType: TerminalGames;
    numberOfPlayers: number;
    startingTokens?: number;
  },
): Promise<Array<PlayerWithInformation>> {
  switch (gameType) {
    case "Standard":
    case "Custom": {
      const players = [];
      for (let i = 0; i < numberOfPlayers; i++) {
        const player = await prompt([{
          name: "name",
          message: "Player Name",
          type: Input,
          validate: (value: string) => {
            if (!value || value.length < 1) return false;
            return true;
          },
        }, {
          name: "age",
          message: "Age",
          type: Input,
          validate: (value: string) => {
            if (parseInt(value) < 0) return false;
            return true;
          },
        }]);

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
