import { MintWorks } from "./mint_works.ts";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.177.0/testing/asserts.ts";

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
        mintWorks.players[0].neighbourhood.plans.find((plan) => plan.name === "Windmill")?.name,
        "Windmill"
      );
    });
    await planTest.step("Add Building", () => {
      mintWorks.players[0].neighbourhood.addBuilding("Mine");
      assertEquals(
        mintWorks.players[0].neighbourhood.plans.find((plan) => plan.name === "Mine")?.name,
        undefined
      );
      assertEquals(
        mintWorks.players[0].neighbourhood.buildings.find((plan) => plan.name === "Mine")?.name,
        "Mine"
      );
    });
    await planTest.step("Remove building", () => {
      mintWorks.players[0].neighbourhood.removeBuilding("Mine");
      assertEquals(
        mintWorks.players[0].neighbourhood.buildings.find((plan) => plan.name === "Mine")?.name,
        undefined
      );
    });
    await planTest.step("Get plan", () => {
      const windmillPlan = mintWorks.players[0].neighbourhood.getPlan("Windmill");
      assertEquals(windmillPlan?.name, "Windmill");
    });
    await planTest.step("Build Plan", async (t) => {
      mintWorks.players[0].neighbourhood.build("Windmill");
      assertEquals(
        mintWorks.players[0].neighbourhood.plans.find((plan) => plan.name === "Windmill")?.name,
        undefined
      );
      assertEquals(
        mintWorks.players[0].neighbourhood.buildings.find(
          (building) => building.name === "Windmill"
        )?.name,
        "Windmill"
      );
      await t.step("Get Building", () => {
        const windmillPlan = mintWorks.players[0].neighbourhood.getBuilding("Windmill");
        assertEquals(windmillPlan?.name, "Windmill");
      });
      await t.step("Remove building", () => {
        mintWorks.players[0].neighbourhood.removeBuilding("Windmill");
        assertEquals(
          mintWorks.players[0].neighbourhood.buildings.find(
            (building) => building.name === "Windmill"
          )?.name,
          undefined
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

Deno.test("Neighbourhood Getting", async (neighbourhoodGettingTest) => {
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
  mintWorks.players[0].neighbourhood.addPlan("Windmill");
  mintWorks.players[0].neighbourhood.addPlan("Factory");
  mintWorks.players[0].neighbourhood.addPlan("Statue", true);
  mintWorks.players[0].neighbourhood.addBuilding("Gardens");
  await neighbourhoodGettingTest.step("Get Plans", () => {
    assertEquals(mintWorks.players[0].neighbourhood.plans.length, 3);
  });
  await neighbourhoodGettingTest.step("Get Buildings", () => {
    assertEquals(mintWorks.players[0].neighbourhood.buildings.length, 1);
  });
  await neighbourhoodGettingTest.step("Get Plans and Buildings", () => {
    const buildingsAndPlans = mintWorks.players[0].neighbourhood.getPlansAndBuildings();
    assertEquals(buildingsAndPlans.plans.length, 3);
    assertEquals(buildingsAndPlans.buildings.length, 1);
  });
});

Deno.test("Public Neighbourhood", async (publicNeighbourhoodTest) => {
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
  mintWorks.players[0].neighbourhood.addPlan("Windmill");
  mintWorks.players[0].neighbourhood.addPlan("Factory");
  mintWorks.players[0].neighbourhood.addPlan("Statue", true);
  mintWorks.players[0].neighbourhood.addBuilding("Gardens");
  assertEquals(mintWorks.players[0].neighbourhood.plans.length, 3);
  assertEquals(mintWorks.players[0].neighbourhood.buildings.length, 1);

  await publicNeighbourhoodTest.step(
    "Initialise Public Neighbourhood",
    async (publicNeighbourhoodInitTest) => {
      const plansAndBuildings = mintWorks.players[0].neighbourhood.getPlansAndBuildings();
      assertEquals(plansAndBuildings.plans.length, 3);
      assertEquals(plansAndBuildings.buildings.length, 1);
      const publicNeighbourhood = new PublicNeighbourhood({
        plans: plansAndBuildings.plans,
        buildings: plansAndBuildings.buildings,
      });
      await publicNeighbourhoodInitTest.step("Has expected plans", () => {
        assertEquals(publicNeighbourhood.plans.length, 3);
        assertEquals(publicNeighbourhood.getPlan("Windmill")?.name, "Windmill");
        assertEquals(publicNeighbourhood.getPlan("Statue")?.name, undefined);
      });
      await publicNeighbourhoodInitTest.step("Has expected buildings", () => {
        assertEquals(publicNeighbourhood.buildings.length, 1);
        assertEquals(publicNeighbourhood.buildings[0].name, "Gardens");
      });
      await publicNeighbourhoodInitTest.step("Calculates stars", () => {
        assertEquals(publicNeighbourhood.stars(), 3);
      });
      await publicNeighbourhoodInitTest.step("Calculates size", () => {
        assertEquals(publicNeighbourhood.size(), 4);
      });
      await publicNeighbourhoodInitTest.step("Hidden plans are hidden", async (hiddenPlanTest) => {
        const hasHiddenPlans = publicNeighbourhood.plans.some((plan) => plan.name === "HIDDEN");
        assertEquals(hasHiddenPlans, true);
        const hiddenPlan = publicNeighbourhood.plans.find((plan) => plan.name === "HIDDEN");
        assertExists(hiddenPlan);
        await hiddenPlanTest.step("Hidden plans are fully masked", () => {
          const originalPlan = mintWorks.players[0].neighbourhood.getPlan("Statue")!;
          assertEquals(
            Object.keys(originalPlan).filter((key) => {
              return (
                hiddenPlan[key as keyof typeof hiddenPlan] ===
                originalPlan[key as keyof typeof hiddenPlan]
              );
            }),
            []
          );
        });
      });
    }
  );
});

Deno.test("Linked Locations", async (locationLinkTest) => {
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
  mintWorks.players[0].neighbourhood.addPlan("Lotto");

  const lottoPlan = mintWorks.players[0].neighbourhood.getPlan("Lotto")!;

  const lottoLocation = mintWorks.locations.find((location) => {
    return location.name === "Lotto";
  })!;

  await locationLinkTest.step("Has linked location", () => {
    assertExists(lottoPlan.linkedLocation);
    assertEquals(lottoPlan.linkedLocation, lottoLocation);
  });
  await locationLinkTest.step("Linked location starts closed", () => {
    assertEquals(lottoLocation.isClosed(), true);
  });
  await locationLinkTest.step("Linked location opens when plan is built", () => {
    mintWorks.players[0].neighbourhood.build("Lotto");
    assertEquals(lottoLocation.isOpen(), true);
  });
  await locationLinkTest.step("Linked location closes when building is removed", () => {
    mintWorks.players[0].neighbourhood.removeBuilding("Lotto");
    assertEquals(lottoLocation.isClosed(), true);
  });
});
