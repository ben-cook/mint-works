import { Player } from "../player.ts";
import { Turn } from "../turn.ts";

export class RandomPlayer implements Player {
  async takeTurn(): Promise<Turn> {
    return {
      playerId: 0,
      action: { _type: "Leadership" },
    };
  }
}
