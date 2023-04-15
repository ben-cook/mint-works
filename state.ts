import { LocationCard } from "./location";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood";
import { Plan } from "./plan";

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
