import { MintWorks } from "./mint_works.ts";
import { gameLogger as logger } from "./logger.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Neighbourhood } from "./neighbourhood.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  logger.info("Welcome to MintWorks!");
  logger.info("Initialising Players...");
  const players = [
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
  logger.info("Initialising MintWorks...");
  const mintWorks = new MintWorks(players);
  mintWorks.play();
}
