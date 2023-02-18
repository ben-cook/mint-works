import { MintWorks } from "./mint_works.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { findWinner } from "./scoring.ts";

Deno.test("Scoring", () => {
  const mintWorks = new MintWorks();
  const playerOneName = "Test Player 1";
  const playerTwoName = "Test Player 2";
  mintWorks.players = [
    {
      label: playerOneName,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(),
      tokens: 5,
    },
    {
      label: playerTwoName,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(),
      tokens: 5,
    },
  ];
  mintWorks.players.find((p) => p.label === playerOneName)!.neighbourhood
    .addPlan("Windmill");
  mintWorks.players.find((p) => p.label === playerTwoName)!.neighbourhood
    .addPlan("Statue");
  assertEquals(findWinner(mintWorks.players), playerTwoName);
});
