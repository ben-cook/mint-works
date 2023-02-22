import { MintWorks, PlayerWithInformation } from "./mint_works.ts";
import { gameLogger as logger } from "./logger.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Neighbourhood } from "./neighbourhood.ts";

import {
  Checkbox,
  Confirm,
  Input,
  Number,
  prompt,
  Select,
} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts";
import { TerminalPlayer } from "./players/terminal_player.ts";

type GameType = "Random" | "Terminal";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  logger.info("Welcome to MintWorks!");
  logger.info("Initialising Players...");

  const gameTypes = [
    "Random",
    "Terminal",
  ] satisfies Array<GameType>;

  const gameChoice = await prompt([{
    name: "choice",
    message: "Select a Game Type",
    type: Select,
    options: gameTypes,
  }]);

  if (!gameChoice.choice) throw new Error("No game type selected");

  const players = await createPlayers(gameChoice.choice as GameType);
  logger.info("Initialising MintWorks...");
  const mintWorks = new MintWorks(players);
  mintWorks.play();
}

async function createPlayers(
  gameType: GameType,
): Promise<Array<PlayerWithInformation>> {
  switch (gameType) {
    case "Terminal": {
      const settings = await prompt([{
        name: "numberOfPlayers",
        message: "How many Players?",
        type: Number,
        validate: (value: string) => {
          if (parseInt(value) < 2) {
            return "You must have at least 2 players";
          } else if (parseInt(value) > 4) {
            return "You must have less than 5 players";
          }
          return true;
        },
      }]);

      if (
        !settings.numberOfPlayers ||
        typeof settings.numberOfPlayers !== "number"
      ) {
        throw new Error("No number of players selected");
      }

      const players = [];
      for (let i = 0; i < settings.numberOfPlayers; i++) {
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
          tokens: 3,
          label: player.name,
          age: parseInt(player.age),
          neighbourhood: new Neighbourhood(),
        });
      }
      return players;
    }

    case "Random":
    default:
      return [
        {
          player: new RandomPlayer("Bob"),
          tokens: 3,
          label: "Bob",
          age: 34,
          neighbourhood: new Neighbourhood(),
        },
        {
          player: new RandomPlayer("Alice"),
          tokens: 3,
          label: "Alice",
          age: 21,
          neighbourhood: new Neighbourhood(),
        },
        {
          player: new RandomPlayer("Jeff"),
          tokens: 3,
          label: "Jeff",
          age: 21,
          neighbourhood: new Neighbourhood(),
        },
      ];
  }
}
