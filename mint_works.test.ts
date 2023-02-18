import { MintWorks } from "./mint_works.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { HandPlan } from "./plan.ts";
import { createPlans } from "./plans.ts";
import { RandomPlayer } from "./players/random_player.ts";
import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("Scoring", () => {
  const mintWorks = new MintWorks();
  const plans = createPlans();
  mintWorks.players = [
    {
      label: "Test Player 1",
      neighbourhood: new Neighbourhood([
        (plans.find((p) => p.name === "Windmill")) as HandPlan,
      ]),
      player: new RandomPlayer(),
      tokens: 5,
    },
    {
      label: "Test Player 2",
      neighbourhood: new Neighbourhood([
        plans.find((p) => p.name === "Statue") as HandPlan,
      ]),
      player: new RandomPlayer(),
      tokens: 5,
    },
  ];
  assertEquals(mintWorks.findWinner(), "Test Player 2");
});
