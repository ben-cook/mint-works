import { logger } from "./logger.ts";
import type { PlayerWithInformation } from "./mint_works.ts";

const lowestPlansTiebreaker = false;

/** Finds the winner from a list of players */
export const findWinner = (
  players: Array<PlayerWithInformation>,
): string | undefined => {
  /** Sort the players in descending order */
  const playersDescendingStars = players.sort((a, b) => {
    if (a.neighbourhood.stars() > b.neighbourhood.stars()) return -1;
    else if (a.neighbourhood.stars() < b.neighbourhood.stars()) return 1;
    else return 0;
  });

  /** Identify the player/s with the highest score (index 0 is highest) */
  const playersHighestStars = playersDescendingStars.filter(
    (p) =>
      p.neighbourhood.stars() ===
        playersDescendingStars[0].neighbourhood.stars(),
  );

  /** If only 1 player has the highest score they win */
  if (playersHighestStars.length === 1) return playersHighestStars[0].label;

  let tiebreaker1 = [] as Array<PlayerWithInformation>;
  if (lowestPlansTiebreaker) {
    /** Tiebreaker 1 (Lowest Plans)*/
    tiebreaker1 = playersHighestStars.sort((a, b) => {
      const aSize = a.neighbourhood.size();
      const bSize = b.neighbourhood.size();
      if (aSize < bSize) return -1;
      else if (aSize > bSize) return 1;
      else return 0;
    });
  } else {
    /** Tiebreaker 1 (Highest Plans) */
    tiebreaker1 = playersHighestStars.sort((a, b) => {
      const aSize = a.neighbourhood.size();
      const bSize = b.neighbourhood.size();
      if (aSize > bSize) return -1;
      else if (aSize < bSize) return 1;
      else return 0;
    });
  }

  const tiebreaker1Players = tiebreaker1.filter(
    (p) =>
      p.neighbourhood.size() ===
        tiebreaker1[0].neighbourhood.size(),
  );

  /** If only 1 player has the highest plans they win */
  if (tiebreaker1Players.length === 1) return tiebreaker1Players[0].label;

  /** Tiebreaker 2 (Most Tokens) */
  const tiebreaker2 = tiebreaker1Players.sort((a, b) => {
    if (a.tokens > b.tokens) return -1;
    else if (a.tokens < b.tokens) return 1;
    else return 0;
  });

  const tiebreaker2Players = tiebreaker2.filter(
    (p) => p.tokens === tiebreaker2[0].tokens,
  );

  /** If only 1 player has the most tokens they win */
  if (tiebreaker2Players.length === 1) return tiebreaker2Players[0].label;

  /** Tiebreaker 3 (Age) */
  // Closest to 42 wins
  const tiebreaker3 = tiebreaker2Players.sort((a, b) => {
    const aAge = Math.abs(a.age - 42);
    const bAge = Math.abs(b.age - 42);
    if (aAge < bAge) return -1;
    else if (aAge > bAge) return 1;
    else return 0;
  });

  const tiebreaker3Players = tiebreaker3.filter(
    (p) => Math.abs(p.age - 42) === Math.abs(tiebreaker3[0].age - 42),
  );

  /** If only 1 player has the closest age they win */
  if (tiebreaker3Players.length === 1) return tiebreaker3Players[0].label;

  /** Tiebreaker 4 (Random) */
  return tiebreaker3Players[
    Math.floor(Math.random() * tiebreaker3Players.length)
  ].label;
};
