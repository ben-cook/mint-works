import { HandPlan, Plan } from "./plan.ts";

export interface Turn {
  playerName: string;
  action: Action;
}

type Place =
  | { _type: "Build"; plan: HandPlan }
  | { _type: "Produce" }
  | { _type: "Leadership" }
  | { _type: "Supply"; plan: Plan };

type Pass = { _type: "Pass" };

type Action = Place | Pass;
