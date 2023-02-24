import { Plan } from "../plan.ts";
import { createPlans } from "../plans.ts";
import { thaiPlans } from "./thai_plans.ts";
import { thaiReskinPlans } from "./thai_reskin_plans.ts";

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
    name: "Thai Plans",
    description: "Custom Pack 1 by Margo and Nat",
    asset: createPlans(thaiPlans),
  }, {
    name: "Thai Reskin Plans",
    description: "Reskin of default from Thai trip",
    asset: createPlans(thaiReskinPlans),
  }],
};
