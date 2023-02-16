import { Turn } from "./turn.ts";

export interface Player {
  /** Make a move */
  takeTurn(): Promise<Turn>;
}
