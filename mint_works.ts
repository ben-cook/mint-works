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
  private simulateTurn(turn: Turn) {}

  public playRound() {
    for (const player of this.players) {
      const turn = player.player.takeTurn();
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
