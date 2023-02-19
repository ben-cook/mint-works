import { Plan } from "./plan.ts";

export type PlanName = typeof plans[number]["name"];

const plans = [
  // Green Cards
  {
    name: "Windmill",
    cost: 1,
    baseStars: 1,
    type: "CULTURE",
  },
  {
    name: "Statue",
    cost: 2,
    baseStars: 2,
    type: "CULTURE",
  },
  {
    name: "Gardens",
    cost: 3,
    baseStars: 3,
    type: "CULTURE",
  },
  // Red Cards
  {
    name: "Workshop",
    cost: 3,
    baseStars: 2,
    type: "PRODUCTION",
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Factory",
    cost: 4,
    baseStars: 3,
    type: "PRODUCTION",
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Co-op",
    cost: 1,
    baseStars: 1,
    type: "PRODUCTION",
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Plant",
    cost: 5,
    baseStars: 2,
    type: "PRODUCTION",
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Mine",
    cost: 2,
    baseStars: 1,
    type: "PRODUCTION",
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  // Orange Cards
  {
    name: "Truck",
    cost: 2,
    baseStars: 1,
    type: "UTILITY",
    // TODO: implement pay less at supplier
    effect: undefined,
  },
  {
    name: "Crane",
    cost: 2,
    baseStars: 1,
    type: "UTILITY",
    // TODO: implement pay less at builder
    effect: undefined,
  },
] as const satisfies ReadonlyArray<Plan>;

export const createPlans = (): Array<Plan> => [...plans];
