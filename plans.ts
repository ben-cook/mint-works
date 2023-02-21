import { PlayerWithInformation } from "./mint_works.ts";
import { Plan } from "./plan.ts";

export type PlanName = typeof plans[number]["name"];

const plans = [
  // Green Cards
  {
    name: "Windmill",
    cost: 1,
    baseStars: 1,
    types: ["Culture"],
  },
  {
    name: "Statue",
    cost: 2,
    baseStars: 2,
    types: ["Culture"],
  },
  {
    name: "Gardens",
    cost: 3,
    baseStars: 3,
    types: ["Culture"],
  },
  // Red Cards
  {
    name: "Workshop",
    cost: 3,
    baseStars: 2,
    types: ["Production"],
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Factory",
    cost: 4,
    baseStars: 3,
    types: ["Production"],
    upkeepHook: (player) => {
      player.tokens += 1;
    },
  },
  {
    name: "Co-op",
    cost: 1,
    baseStars: 1,
    types: ["Production"],
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Plant",
    cost: 5,
    baseStars: 2,
    types: ["Production"],
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Mine",
    cost: 2,
    baseStars: 1,
    types: ["Production"],
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  // Orange Cards
  {
    name: "Truck",
    cost: 2,
    baseStars: 1,
    types: ["Utility"],
    // TODO: implement pay less at supplier
    effect: undefined,
  },
  {
    name: "Crane",
    cost: 2,
    baseStars: 1,
    types: ["Utility"],
    // TODO: implement pay less at builder
    effect: undefined,
  },
] as const satisfies ReadonlyArray<Plan>;

export const createPlans = (): Array<Plan> => [...plans];
