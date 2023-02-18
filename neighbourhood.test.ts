import { MintWorks } from "./mint_works.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("Neighbourhood", async (t) => {
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
  await t.step("Add plan", async (t) => {
    mintWorks.players[0].neighbourhood.addPlan("Windmill");
    mintWorks.players[0].neighbourhood.addPlan("Statue");
    assertEquals(
      mintWorks.players[0].neighbourhood.getPlan("Windmill")?.name,
      "Windmill",
    );
    assertEquals(
      mintWorks.players[0].neighbourhood.getPlan("Statue")?.name,
      "Statue",
    );
    await t.step("Build Plan", async (t) => {
      mintWorks.players[0].neighbourhood.build("Windmill");
      assertEquals(
        mintWorks.players[0].neighbourhood.getPlan("Windmill"),
        undefined,
      );
      assertEquals(
        mintWorks.players[0].neighbourhood.getBuilding("Windmill")?.name,
        "Windmill",
      );
      await t.step("Remove building", () => {
        mintWorks.players[0].neighbourhood.removeBuilding("Windmill");
        assertEquals(
          mintWorks.players[0].neighbourhood.getBuilding("Windmill"),
          undefined,
        );
      });
    });
  });

  await t.step("Remove plan", () => {
    assertEquals(
      mintWorks.players[0].neighbourhood.getPlan("Statue")?.name,
      "Statue",
    );
    mintWorks.players[0].neighbourhood.removePlan("Statue");
    assertEquals(
      mintWorks.players[0].neighbourhood.getPlan("Statue")?.name,
      undefined,
    );
  });
});
