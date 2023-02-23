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
    hooks: {
      upkeep: {
        pre: ({ player }) => {
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
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += 1;
        },
      },
    },
  },
  {
    name: "Factory",
    cost: 4,
    baseStars: 3,
    types: ["Production"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += 1;
        },
      },
    },
  },
  {
    name: "Co-op",
    cost: 1,
    baseStars: 1,
    types: ["Production"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += 1;
        },
        post: () => {
          // TODO: Implement this
        },
      },
    },
  },
  {
    name: "Plant",
    cost: 5,
    baseStars: 2,
    types: ["Production"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += 2;
        },
      },
    },
  },
  {
    name: "Mine",
    cost: 2,
    baseStars: 1,
    types: ["Production"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += 1;
        },
      },
    },
  },
  {
    name: "Stripmine",
    cost: 4,
    baseStars: 0,
    types: ["Production"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += 3;
        },
      },
    },
  },
  {
    name: "Corporate HQ",
    cost: 3,
    baseStars: 0,
    types: ["Production"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += player.neighbourhood.buildings.length;
        },
      },
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
    hooks: {
      build: {
        pre: () => {
          return { _type: "tokens", tokens: -1 };
        },
      },
    },
    effect: undefined,
  },
  {
    name: "Assembler",
    cost: 5,
    baseStars: 1,
    types: ["Utility"],
    hooks: {
      supply: {
        post: () => {
          return { _type: "build" };
        },
      },
    },
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
    hooks: {
      upkeep: {
        pre: ({ player, locations }) => {
          const wholesaler = locations.find((l) => l.name === "Wholesaler");
          if (!wholesaler) {
            throw new Error("No Wholesaler was found in upkeep phase");
          }
          if (!wholesaler.available()) {
            player.tokens += 2;
          }
        },
      },
      build: {
        post: ({ locations }) => {
          const wholesaler = locations.find((l) => l.name === "Lotto");
          if (!wholesaler) {
            throw new Error("NO wholesaler FOUND IN LOTTO POST BUILD HOOK");
          }
          if (wholesaler.isClosed()) wholesaler.openLocation();
        },
      },
    },
  },
  {
    name: "Lotto",
    cost: 4,
    baseStars: 2,
    types: ["Deed"],
    hooks: {
      upkeep: {
        pre: ({ player, locations }) => {
          const lotto = locations.find((l) => l.name === "Lotto");
          if (!lotto) {
            throw new Error("No Lotto was found in upkeep phase");
          }
          if (!lotto.available()) {
            player.tokens += 2;
          }
        },
      },
      build: {
        post: ({ locations }) => {
          const lotto = locations.find((l) => l.name === "Lotto");
          if (!lotto) {
            throw new Error("NO LOTTO FOUND IN LOTTO POST BUILD HOOK");
          }
          if (lotto.isClosed()) lotto.openLocation();
        },
      },
    },
  },
] as const satisfies ReadonlyArray<Plan>;

export const createPlans = (): Array<Plan> => [...plans];
