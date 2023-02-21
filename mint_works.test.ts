import { MintWorks } from "./mint_works.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";

Deno.test("MintWorks", async (t) => {
  await t.step("Has plans", () => {
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
    assertEquals(
      mintWorks.players[0].neighbourhood.getPlan("Windmill")?.name,
      "Windmill",
    );
  });
});

Deno.test("Upkeep (Test 1)", async (t) => {
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
  await t.step("Upkeep gives all players 1 token", () => {
    mintWorks.upkeep();
    assertEquals(mintWorks.players[0].tokens, 6);
    assertEquals(mintWorks.players[1].tokens, 6);
  });
  await t.step("Upkeep with Factory adds 2 token instead", () => {
    mintWorks.players[0].neighbourhood.addBuilding("Factory");
    mintWorks.upkeep();
    assertEquals(mintWorks.players[0].tokens, 8);
    assertEquals(mintWorks.players[1].tokens, 7);
  });
});

Deno.test("Upkeep Test 2", async (t) => {
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
  await t.step("Upkeep with Corporate HQ with 2 buildings", () => {
    mintWorks.players[0].neighbourhood.addBuilding("Gardens");
    mintWorks.players[0].neighbourhood.addBuilding("Corporate HQ");
    assertEquals(mintWorks.players[0].tokens, 5);
    mintWorks.upkeep();
    assertEquals(mintWorks.players[0].tokens, 8);
  });
});

Deno.test("Upkeep Test 3", async (t) => {
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
  await t.step("Upkeep of Gallery that increases star count by 1", () => {
    mintWorks.players[0].neighbourhood.addBuilding("Gallery");
    assertEquals(mintWorks.players[0].neighbourhood.stars(), 0);
    mintWorks.upkeep();
    assertEquals(mintWorks.players[0].neighbourhood.stars(), 1);
  });
});

Deno.test("Lotto Upkeep Test", async (t) => {
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
  await t.step("Upkeep of Lotto", () => {
    mintWorks.players[0].neighbourhood.addBuilding("Lotto");
    const Lotto = mintWorks.locations.find((l) => l.name === "Lotto")!;
    Lotto.openLocation();
    Lotto.slots[0].fill(2);
    assertEquals(mintWorks.players[0].tokens, 5);
    mintWorks.upkeep();
    assertEquals(mintWorks.players[0].tokens, 8);
  });
});
