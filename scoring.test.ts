import { MintWorks } from "./mint_works.ts";
import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Neighbourhood } from "./neighbourhood.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { findWinner } from "./scoring.ts";

Deno.test("Scoring", () => {
  const mintWorks = new MintWorks();
  const playerOneName = "Test Player 1";
  const playerTwoName = "Test Player 2";
  const playerOneAge = 21;
  const playerTwoAge = 34;
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
  ];
  mintWorks.players.find((p) => p.label === playerOneName)!.neighbourhood
    .addBuilding("Windmill");
  mintWorks.players.find((p) => p.label === playerTwoName)!.neighbourhood
    .addBuilding("Statue");
  assertEquals(findWinner(mintWorks.players).winner, playerTwoName);
});
