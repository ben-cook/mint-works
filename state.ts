import { Building, HandPlan, Plan } from "./plan.ts";

export interface State {
  locations: Array<Location>;
  planSupply: Array<Plan>;
  numPlansInDeck: number;
  players: Array<{
    neighbourhood: Array<Building | HandPlan | "Hidden">;
    tokens: number;
    label: string;
  }>;
}
