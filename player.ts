import { State } from "./state.ts";
import { Turn } from "./turn.ts";

export interface IPlayer {
  /** The `takeTurn` method is called when it is this player's turn.
   * @returns A promise that resolves to the turn that the player chooses
   */
  takeTurn: (state: State) => Promise<Turn>;
  /** The `update` method is called to inform a given player of the other player's moves.
   * This could be used to update a UI, to train a model, etc.
   */
  update?: (turn: Turn) => void;
}
