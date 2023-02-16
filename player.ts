import { State } from "./state.ts";
import { Turn } from "./turn.ts";

export interface Player {
  /** Make a move */
  takeTurn(state: State): Promise<Turn>;
}
