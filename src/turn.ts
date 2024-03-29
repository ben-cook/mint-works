import { HandPlan, Plan } from "./plan";

export interface Turn {
  playerName: string;
  action: Action;
}

type Place =
  | { _type: "Build"; plan: HandPlan }
  | { _type: "Produce" }
  | { _type: "Leadership"; playerName: string }
  | { _type: "Supply"; plan: Plan }
  | { _type: "Lotto" }
  | { _type: "Wholesale" };

type Pass = { _type: "Pass" };

type Action = Place | Pass;
