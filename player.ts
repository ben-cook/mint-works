import { Turn } from "./turn.ts";

export interface Player {
  /** Make a move */
  takeTurn(): Turn;
}
