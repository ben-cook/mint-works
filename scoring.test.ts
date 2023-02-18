import { MintWorks } from "./mint_works.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { findWinner } from "./scoring.ts";

Deno.test("Scoring", () => {
  const mintWorks = new MintWorks();
  mintWorks.players = [
    {
      label: "Test Player 1",
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(),
      tokens: 5,
    },
    {
      label: "Test Player 2",
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(),
      tokens: 5,
    },
  ];
  mintWorks.players[0].neighbourhood.addPlan("Windmill");
  mintWorks.players[1].neighbourhood.addPlan("Statue");
  assertEquals(findWinner(mintWorks.players), "Test Player 2");
});
