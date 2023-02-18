import { LocationCard } from "./location.ts";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood.ts";
import { Plan } from "./plan.ts";

/** This game state is passed to players when they are asked to make moves */
export interface State {
  locations: Array<LocationCard>;
  planSupply: Array<Plan>;
  numPlansInDeck: number;
  players: Array<{
    neighbourhood: Neighbourhood | PublicNeighbourhood;
    tokens: number;
    label: string;
  }>;
}
