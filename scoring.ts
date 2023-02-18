import { logger } from "./logger.ts";
import type { PlayerWithInformation } from "./mint_works.ts";

const lowestPlansTiebreaker = false;

/** Finds the winner from a list of players */
export const findWinner = (
  players: Array<PlayerWithInformation>,
): string | undefined => {
  let winner;

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
  if (playersHighestStars.length !== 1) {
    logger.info(playersHighestStars[0].label + " won!");
    winner = playersHighestStars[0].label;
  } else {
    let tiebreaker1 = [] as Array<PlayerWithInformation>;
    if (lowestPlansTiebreaker) {
      /** Tiebreaker 1 (Lowest Plans)*/
      tiebreaker1 = playersHighestStars.sort((a, b) => {
        if (a.neighbourhood.plans.length < b.neighbourhood.plans.length) {
          return -1;
        } else if (
          a.neighbourhood.plans.length > b.neighbourhood.plans.length
        ) {
          return 1;
        } else return 0;
      });
    } else {
      /** Tiebreaker 1 (Highest Plans) */
      tiebreaker1 = playersHighestStars.sort((a, b) => {
        if (a.neighbourhood.plans.length > b.neighbourhood.plans.length) {
          return -1;
        } else if (
          a.neighbourhood.plans.length < b.neighbourhood.plans.length
        ) {
          return 1;
        } else return 0;
      });
    }

    const tiebreaker1Players = tiebreaker1.filter(
      (p) =>
        p.neighbourhood.plans.length ===
          tiebreaker1[0].neighbourhood.plans.length,
    );

    /** If only 1 player has the highest plans they win */
    if (tiebreaker1Players.length === 1) {
      logger.info(tiebreaker1Players[0].label + " won!");
      winner = tiebreaker1Players[0].label;
    }
  }

  return winner;
};
