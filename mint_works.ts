import { Player } from "./player";
import { RandomPlayer } from "./players/random_player";
import { Round } from "./Round";

export class MintWorks {
  rounds: Array<Round>;
  players: Array<Player>;

  constructor(players?: Array<Player>) {
    if (players) {
      this.players = players;
    } else {
      this.players = [new RandomPlayer(), new RandomPlayer()];
    }
  }

  /** Simulate taking a turn */
  private simulateTurn(turn: Turn) {}

  public playRound() {
    for (const player of this.players) {
      const turn = player.takeTurn();
    }
  }
}
