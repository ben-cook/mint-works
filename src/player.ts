import { PlayerWithInformation } from "./types";
import { HookEffect } from "./plan";
import { State } from "./state";
import { Turn } from "./turn";

export interface IPlayer {
  /** The `takeTurn` method is called when it is this player's turn.
   * @returns A promise that resolves to the turn that the player chooses
   */
  takeTurn: (state: State) => Promise<Turn>;
  /** The `selectPlayerForEffect` method is called when the player must select another player to apply an effect to.
   * @returns A promise that resolves to the player to apply the effect to
   */
  selectPlayerForEffect: (
    appliedEffect: HookEffect,
    players: Array<PlayerWithInformation>
  ) => Promise<string>;
  /** The `update` method is called to inform a given player of the other player's moves.
   * This could be used to update a UI, to train a model, etc.
   */
  update?: (turn: Turn) => void;
}
