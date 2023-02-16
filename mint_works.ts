import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Round } from "./Round.ts";
import { Turn } from "./turn.ts";

export class MintWorks {
  rounds: Array<Round>;
  players: Array<Player>;

  constructor(players?: Array<Player>) {
    if (players) {
      this.players = players;
    } else {
      this.players = [new RandomPlayer(), new RandomPlayer()];
    }

    this.rounds = [];
  }

  /** Simulate taking a turn */
  private simulateTurn(turn: Turn) {}

  public playRound() {
    for (const player of this.players) {
      const turn = player.takeTurn();
    }
  }
}
