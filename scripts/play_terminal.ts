import { MintWorks, MintWorksParams } from "../src/mint_works";
import { gameLogger as logger } from "../src/logger";

import inquirer from "inquirer";
import { createTerminalGame } from "../games/terminal_game";
import { createRandomGame } from "../games/random_game";

type GameInterface =
  | "Random"
  | "Terminal";


  async function main(): Promise<void> {
    logger.info("Welcome to MintWorks!");
  logger.info("Initialising Players...");

  const gameInterfaces = [
    "Random",
    "Terminal",
  ] satisfies Array<GameInterface>;

  const gameChoice = await inquirer.prompt([{
    name: "choice",
    message: "Select a Game Type",
    type: "list",
    choices: gameInterfaces,
  }]);

  if (!gameChoice.choice) throw new Error("No game type selected");

  const mintWorks = await createGame(gameChoice.choice as GameInterface);

  mintWorks.play();
  }
  
  

async function createGame(gameInterface: GameInterface) {
  logger.info("Initialising MintWorks...");

  const settings = await inquirer.prompt([{
    name: "numberOfPlayers",
    message: "How many Players?",
    type: "number",
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

  let gameParams = {} as MintWorksParams;
  switch (gameInterface) {
    case "Terminal":
      gameParams = await createTerminalGame({
        numberOfPlayers: settings.numberOfPlayers,
      });
      break;

    case "Random":
    default:
      gameParams = await createRandomGame({
        numberOfPlayers: settings.numberOfPlayers,
      });
      break;
  }

  return new MintWorks(gameParams, () => logger.info("Game Over"));
}

main();
