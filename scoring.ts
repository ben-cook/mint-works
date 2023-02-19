import type { PlayerWithInformation } from "./mint_works.ts";

export interface ScoreBoard {
  winner: string;
  scores: Array<Score>;
}

export interface Score {
  player: PlayerWithInformation;
  stars: number;
  plans: number;
  tokens: number;
}

/** Finds the winner from a list of players */
export const findWinner = (
  players: Array<PlayerWithInformation>,
): ScoreBoard => {
  const scores: Array<Score> = players.map((p) => ({
    player: p,
    stars: p.neighbourhood.stars(),
    plans: p.neighbourhood.size(),
    tokens: p.tokens,
  }));
  //sort scores by stars then plans then tokens
  scores.sort((a, b) => {
    if (a.stars > b.stars) return -1;
    else if (a.stars < b.stars) return 1;
    else {
      if (a.plans > b.plans) return -1;
      else if (a.plans < b.plans) return 1;
      else {
        return b.tokens - a.tokens;
      }
    }
  });

  // If there is a tie
  const scoreWinners = scores.filter((s) =>
    s.stars === scores[0].stars && s.plans === scores[0].plans &&
    s.tokens === scores[0].tokens
  );

  if (scoreWinners.length === 1) {
    return {
      winner: scoreWinners[0].player.label,
      scores: scores,
    };
  }

  /** Tiebreaker 3 (Age) */
  // Closest to 42 wins
  const tiebreakerAge = scoreWinners.sort((a, b) => {
    return Math.abs(a.player.age - 42) - Math.abs(b.player.age - 42);
  });

  const tiebreakerAgeWinners = tiebreakerAge.filter(
    (p) =>
      Math.abs(p.player.age - 42) ===
        Math.abs(tiebreakerAge[0].player.age - 42),
  );

  /** If only 1 player has the closest age they win */
  if (tiebreakerAgeWinners.length === 1) {
    return {
      winner: tiebreakerAgeWinners[0].player.label,
      scores: scores,
    };
  }

  /** Tiebreaker 4 (Random) */
  const randomWinner = tiebreakerAgeWinners[
    Math.floor(Math.random() * tiebreakerAgeWinners.length)
  ];
  return {
    winner: randomWinner.player.label,
    scores: scores,
  };
};
