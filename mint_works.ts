import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Round } from "./Round.ts";
import { Turn } from "./turn.ts";

interface PlayerWithTokens {
  player: Player;
  tokens: number;
}

export class MintWorks {
  rounds: Array<Round>;
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

    this.rounds = [];
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
      console.debug(`Round ${0}`);
      this.playRound();
    }
  }

  private somebodyHasWon() {
    return false;
  }
}
