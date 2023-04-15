import { MintWorks } from "./mint_works.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { findWinner } from "./scoring.ts";

Deno.test("Scoring victory", async (scoreTest) => {
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
  await scoreTest.step("Primary - Most Stars", () => {
    mintWorks.players.find((p) => p.label === playerOneName)!.neighbourhood
      .addBuilding("Windmill");
    mintWorks.players.find((p) => p.label === playerTwoName)!.neighbourhood
      .addBuilding("Statue");
    assertEquals(findWinner(mintWorks.players).winner, playerTwoName);
  });
  await scoreTest.step("Tiebreaker 1 - Largest Neighbourhood", () => {
    mintWorks.players.find((p) => p.label === playerThreeName)!.neighbourhood
      .addBuilding("Statue");
    mintWorks.players.find((p) => p.label === playerThreeName)!.neighbourhood
      .addPlan("Gardens");
    assertEquals(findWinner(mintWorks.players).winner, playerThreeName);
  });
  await scoreTest.step("Tiebreaker 2 - Most Tokens", () => {
    mintWorks.players.find((p) => p.label === playerTwoName)!.neighbourhood
      .addPlan("Crane");
    mintWorks.players.find((p) => p.label === playerTwoName)!.tokens += 5;
    assertEquals(findWinner(mintWorks.players).winner, playerTwoName);
  });
  await scoreTest.step("Tiebreaker 3 - Closest to age 42", () => {
    mintWorks.players.find((p) => p.label === playerThreeName)!.tokens += 5;
    assertEquals(findWinner(mintWorks.players).winner, playerThreeName);
  });
  await scoreTest.step("Tiebreaker 4 - Random", () => {
    // Reset all players to the same age and neighbourhood and tokens
    mintWorks.players.forEach((p) => {
      p.age = 42;
      p.neighbourhood = new Neighbourhood();
      p.tokens = 5;
    });
    // Runs the game 1000 times and checks that all 3 players win at least once, meaning random works
    const winners = new Set();
    for (let i = 0; i < 1000; i++) {
      winners.add(findWinner(mintWorks.players).winner);
    }
    assertEquals(winners.size, 3);
  });
});
