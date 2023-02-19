import { MintWorks } from "./mint_works.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { findWinner } from "./scoring.ts";

Deno.test("Scoring", async (scoreTest) => {
  const mintWorks = new MintWorks();
  const playerOneName = "Test Player 1";
  const playerTwoName = "Test Player 2";
  const playerThreeName = "Test Player 3";
  const playerOneAge = 21;
  const playerTwoAge = 34;
  const playerThreeAge = 42;
  mintWorks.players = [
    {
      label: playerOneName,
      age: playerOneAge,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(playerOneName),
      tokens: 5,
    },
    {
      label: playerTwoName,
      age: playerTwoAge,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(playerTwoName),
      tokens: 5,
    },
    {
      label: playerThreeName,
      age: playerThreeAge,
      neighbourhood: new Neighbourhood(),
      player: new RandomPlayer(playerThreeName),
      tokens: 5,
    },
  ];
  await scoreTest.step("Star victory", () => {
    mintWorks.players.find((p) => p.label === playerOneName)!.neighbourhood
      .addBuilding("Windmill");
    mintWorks.players.find((p) => p.label === playerTwoName)!.neighbourhood
      .addBuilding("Statue");
    assertEquals(findWinner(mintWorks.players).winner, playerTwoName);
  });
  await scoreTest.step("Neighbourhood size victory", () => {
    mintWorks.players.find((p) => p.label === playerThreeName)!.neighbourhood
      .addBuilding("Statue");
    mintWorks.players.find((p) => p.label === playerThreeName)!.neighbourhood
      .addPlan("Gardens");
    assertEquals(findWinner(mintWorks.players).winner, playerThreeName);
  });
  await scoreTest.step("Token victory", () => {
    mintWorks.players.find((p) => p.label === playerTwoName)!.neighbourhood
      .addPlan("Crane");
    mintWorks.players.find((p) => p.label === playerTwoName)!.tokens += 5;
    assertEquals(findWinner(mintWorks.players).winner, playerTwoName);
  });
  await scoreTest.step("Token victory", () => {
    mintWorks.players.find((p) => p.label === playerThreeName)!.tokens += 5;
    assertEquals(findWinner(mintWorks.players).winner, playerThreeName);
  });
});
