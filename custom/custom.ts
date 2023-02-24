import { Plan } from "../plan.ts";
import { createPlans } from "../plans.ts";
import { pinkPlans } from "./pink_plans.ts";

export interface CustomAsset {
  name: string;
  description: string;
  asset: Array<Plan>;
}

export interface CustomAssets {
  decks: Array<CustomAsset>;
}

export const customAssets: CustomAssets = {
  decks: [{
    name: "Pink Plans",
    description: "Custom Pack 1 by Margo and Nat",
    asset: createPlans(pinkPlans),
  }],
};
