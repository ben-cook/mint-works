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
  {
    name: "Museum",
    cost: 2,
    baseStars: 0,
    types: ["Culture"],
    // TODO: Implement starHook
  },
  {
    name: "Gallery",
    cost: 4,
    baseStars: 0,
    types: ["Culture"],
    upkeepHook: (player) => {
      const gallery = player.neighbourhood.buildings.find((b) =>
        b.name === "Gallery"
      );
      if (!gallery) {
        throw new Error("No Gallery Found in Upkeep Hook - Blame RYAN");
      }
      gallery.additionalStars
        ? gallery.additionalStars += 1
        : gallery.additionalStars = 1;
    },
  },
  {
    name: "Bridge",
    cost: 1,
    baseStars: 0,
    types: ["Culture", "Culture"],
  },
  // Red Cards
  {
    name: "Workshop",
    cost: 3,
    baseStars: 2,
    types: ["Production"],
    upkeepHook: (player) => {
      player.tokens += 1;
    },
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
    upkeepHook: undefined,
  },
  {
    name: "Plant",
    cost: 5,
    baseStars: 2,
    types: ["Production"],
    upkeepHook: (player) => {
      player.tokens += 2;
    },
  },
  {
    name: "Mine",
    cost: 2,
    baseStars: 1,
    types: ["Production"],
    upkeepHook: (player) => {
      player.tokens += 1;
    },
  },
  {
    name: "Stripmine",
    cost: 4,
    baseStars: 0,
    types: ["Production"],
    upkeepHook: (player) => {
      player.tokens += 3;
    },
  },
  {
    name: "Corporate HQ",
    cost: 3,
    baseStars: 0,
    types: ["Production"],
    upkeepHook: (player) => {
      player.tokens += player.neighbourhood.buildings.length;
    },
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
  {
    name: "Assembler",
    cost: 5,
    baseStars: 1,
    types: ["Utility"],
    // TODO: implement automatic build
  },
  {
    name: "Landfill",
    cost: 3,
    baseStars: 3,
    types: ["Utility"],
    // TODO: Add starHook
  },
  {
    name: "Vault",
    cost: 5,
    baseStars: 1,
    types: ["Utility"],
    // TODO: Add starHook
  },
  {
    name: "Obelisk",
    cost: 4,
    baseStars: 0,
    types: ["Utility"],
    // TODO: Add starHook
  },

  {
    name: "Wholesaler",
    cost: 1,
    baseStars: 1,
    types: ["Deed"],
  },
  {
    name: "Lotto",
    cost: 4,
    baseStars: 2,
    types: ["Deed"],
  },
] as const satisfies ReadonlyArray<Plan>;

export const createPlans = (): Array<Plan> => [...plans];
