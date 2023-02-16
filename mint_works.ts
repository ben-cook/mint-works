import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Round } from "./round.ts";
import { Turn } from "./turn.ts";
import { logger } from "./logger.ts";

interface PlayerWithTokens {
  player: Player;
  tokens: number;
}

export class MintWorks {
  roundNumber;
  // TODO: location cards
  locations: any;
  players: Array<PlayerWithTokens>;

  constructor(players?: Array<PlayerWithTokens>) {
    if (players) {
      this.players = players;
    } else {
      this.players = [
        { player: new RandomPlayer(), tokens: 0 },
        { player: new RandomPlayer(), tokens: 0 },
      ];
    }

    this.roundNumber = 1;
  }

  /** Simulate taking a turn */
  private simulateTurn(turn: Turn) {
    const playerTokens = this.players[turn.playerId].tokens;
    if (turn.action._type === "Build") {
      if (playerTokens < 2) {
        throw new Error(
          `Player ${turn.playerId} does not have sufficient tokens to build. Tokens: ${playerTokens}. Required tokens: 2`
        );
      }
    }
  }

  public async playRound() {
    for (const player of this.players) {
      const turn = await player.player.takeTurn();
      try {
        this.simulateTurn(turn);
      } catch (err) {
        logger.error(`Invalid turn! Error: ${err}`);
      }
    }
  }

  public play() {
    while (!this.somebodyHasWon()) {
      logger.info(`Round ${this.roundNumber}`);
      this.playRound();
      this.roundNumber++;
    }
  }

  private somebodyHasWon() {
    return Math.random() < 0.2;
  }
}
