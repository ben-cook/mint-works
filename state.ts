import { LocationCard } from "./location.ts";
import { Building, HandPlan, Plan } from "./plan.ts";

/** This game state is passed to players when they are asked to make moves */
export interface State {
  locations: Array<LocationCard>;
  planSupply: Array<Plan>;
  numPlansInDeck: number;
  players: Array<{
    neighbourhood: Array<Building | HandPlan | "Hidden">;
    tokens: number;
    label: string;
  }>;
}
