import { HandPlan } from "./plan.ts";

export interface Turn {
  playerId: number;
  action: Action;
}

type Place =
  | { _type: "Build"; plan: HandPlan }
  | { _type: "Produce" }
  | { _type: "Leadership" }
  | { _type: "Supply"; plan: HandPlan };

type Pass = { _type: "Pass" };

type Action = Place | Pass;
