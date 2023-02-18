import { Plan } from "./plan.ts";

const plans = [
  // Green Cards
  {
    name: "Windmill",
    cost: 1,
    baseStars: 1,
  },
  {
    name: "Statue",
    cost: 2,
    baseStars: 2,
  },
  {
    name: "Gardens",
    cost: 3,
    baseStars: 3,
  },
  // Red Cards
  {
    name: "Workshop",
    cost: 3,
    baseStars: 2,
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Factory",
    cost: 4,
    baseStars: 3,
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Co-op",
    cost: 1,
    baseStars: 1,
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Plant",
    cost: 5,
    baseStars: 2,
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  {
    name: "Mine",
    cost: 2,
    baseStars: 1,
    // TODO: implement upkeepHook
    upkeepHook: undefined,
  },
  // Orange Cards
  {
    name: "Truck",
    cost: 2,
    baseStars: 1,
    // TODO: implement pay less at supplier
    effect: undefined,
  },
] satisfies Array<Plan>;

export const createPlans = () => [...plans];
