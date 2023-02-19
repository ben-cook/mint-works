import { MintWorks } from "./mint_works.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("Neighbourhood", async (neighbourhoodTest) => {
  const mintWorks = new MintWorks();
  mintWorks.players = [
    {
      label: "Test Player 1",
      age: 21,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer("Test Player 1"),
      tokens: 5,
    },
    {
      label: "Test Player 2",
      age: 34,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer("Test Player 2"),
      tokens: 5,
    },
  ];
  await neighbourhoodTest.step("Plan Management", async (planTest) => {
    await planTest.step("Add plan", () => {
      mintWorks.players[0].neighbourhood.addPlan("Windmill");
      assertEquals(
        mintWorks.players[0].neighbourhood.plans.find((plan) =>
          plan.name === "Windmill"
        )?.name,
        "Windmill",
      );
    });
    await planTest.step("Get plan", () => {
      const windmillPlan = mintWorks.players[0].neighbourhood.getPlan(
        "Windmill",
      );
      assertEquals(windmillPlan?.name, "Windmill");
    });
    await planTest.step("Build Plan", async (t) => {
      mintWorks.players[0].neighbourhood.build("Windmill");
      assertEquals(
        mintWorks.players[0].neighbourhood.plans.find((plan) =>
          plan.name === "Windmill"
        )?.name,
        undefined,
      );
      assertEquals(
        mintWorks.players[0].neighbourhood.buildings.find((building) =>
          building.name === "Windmill"
        )?.name,
        "Windmill",
      );
      await t.step("Get Building", () => {
        const windmillPlan = mintWorks.players[0].neighbourhood.getBuilding(
          "Windmill",
        );
        assertEquals(windmillPlan?.name, "Windmill");
      });
      await t.step("Remove building", () => {
        mintWorks.players[0].neighbourhood.removeBuilding("Windmill");
        assertEquals(
          mintWorks.players[0].neighbourhood.buildings.find((building) =>
            building.name === "Windmill"
          )?.name,
          undefined,
        );
      });
    });
  });

  await neighbourhoodTest.step("Stars", async (starTest) => {
    assertEquals(mintWorks.players[0].neighbourhood.stars(), 0);
    assertEquals(mintWorks.players[0].neighbourhood.plans.length, 0);
    assertEquals(mintWorks.players[0].neighbourhood.buildings.length, 0);
    await starTest.step("Plans don't add stars", () => {
      mintWorks.players[0].neighbourhood.addPlan("Windmill");
      assertEquals(mintWorks.players[0].neighbourhood.stars(), 0);
    });
    await starTest.step("Buildings add stars", () => {
      mintWorks.players[0].neighbourhood.build("Windmill");
      assertEquals(mintWorks.players[0].neighbourhood.buildings.length, 1);
      assertEquals(mintWorks.players[0].neighbourhood.stars(), 1);
    });
    await starTest.step("Multiple buildings add stars", () => {
      mintWorks.players[0].neighbourhood.addBuilding("Statue");
      assertEquals(mintWorks.players[0].neighbourhood.buildings.length, 2);
      assertEquals(mintWorks.players[0].neighbourhood.stars(), 3);
    });
    await starTest.step("Only buildings add stars", () => {
      mintWorks.players[0].neighbourhood.addPlan("Gardens");
      assertEquals(mintWorks.players[0].neighbourhood.buildings.length, 2);
      assertEquals(mintWorks.players[0].neighbourhood.plans.length, 1);
      assertEquals(mintWorks.players[0].neighbourhood.stars(), 3);
    });
  });

  await neighbourhoodTest.step("Size", () => {
    assertEquals(mintWorks.players[0].neighbourhood.size(), 3);
  });
});
