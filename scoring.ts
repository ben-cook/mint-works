import { logger } from "./logger.ts";
import type { PlayerWithInformation } from "./mint_works.ts";

const lowestPlansTiebreaker = false;

type WinType =
  | "Stars"
  | "Lowest Plans"
  | "Highest Plans"
  | "Tokens"
  | "Age"
  | "Random";
export interface ScoreBoard {
  winner: string;
  winType: WinType;
  scores: Array<
    { label: string; stars: number; plans: number; tokens: number }
  >;
}

export interface Winner {
  label: string;
  winType: WinType;
  score: number;
}

/** Finds the winner from a list of players */
export const findWinner = (
  players: Array<PlayerWithInformation>,
): Winner | undefined => {
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
  if (playersHighestStars.length === 1) {
    return {
      label: playersHighestStars[0].label,
      winType: "Stars",
      score: playersHighestStars[0].neighbourhood.stars(),
    };
  }

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
  if (tiebreaker1Players.length === 1) {
    return {
      label: tiebreaker1[0].label,
      winType: lowestPlansTiebreaker ? "Lowest Plans" : "Highest Plans",
      score: tiebreaker1[0].neighbourhood.size(),
    };
  }

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
  if (tiebreaker2Players.length === 1) {
    return {
      label: tiebreaker2[0].label,
      winType: "Tokens",
      score: tiebreaker2[0].tokens,
    };
  }

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
  if (tiebreaker3Players.length === 1) {
    return {
      label: tiebreaker2[0].label,
      winType: "Age",
      score: tiebreaker2[0].age,
    };
  }

  /** Tiebreaker 4 (Random) */
  const randomWinner = tiebreaker3Players[
    Math.floor(Math.random() * tiebreaker3Players.length)
  ];
  return {
    label: randomWinner.label,
    winType: "Random",
    score: 0,
  };
};

export const scoreBoard = (
  players: Array<PlayerWithInformation>,
  winner: Winner,
): ScoreBoard => {
  const scores = players.map((p) => ({
    label: p.label,
    stars: p.neighbourhood.stars(),
    plans: p.neighbourhood.size(),
    tokens: p.tokens,
  }));
  return {
    winner: winner.label,
    winType: winner.winType,
    scores,
  };
};
