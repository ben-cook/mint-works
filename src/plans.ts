import { Plan } from "./plan";

export type PlanName = (typeof plans)[number]["name"];

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
    description: ":STAR: per :CULTURE: building",
    hooks: {
      turn: {
        /**
         *
         */
        post: ({ player, building }) => {
          const museum = player.neighbourhood.buildings.find((b) => b.name === building.name);
          if (!museum) {
            throw new Error("No Museum object Found in Post-turn Hook");
          }
          const cultureBuildings = player.neighbourhood.buildings.filter((b) =>
            b.types.includes("Culture")
          );
          const cultureMap = cultureBuildings
            .map((b) => {
              return b.types.join(",");
            })
            .join(",")
            .split(",")
            .filter((t) => t !== "");
          museum.additionalStars = cultureMap.length;
        },
      },
    },
  },
  {
    name: "Gallery",
    cost: 4,
    baseStars: 0,
    types: ["Culture"],
    description: "Upkeep: Add :TOKEN: from the Mint Supply to Gallery",
    hooks: {
      upkeep: {
        /**
         *
         */
        pre: ({ player, building }) => {
          const gallery = player.neighbourhood.buildings.find((b) => b.name === building.name);
          if (!gallery) {
            throw new Error("No Gallery Found in Upkeep Hook - Blame RYAN");
          }
          gallery.additionalStars ? (gallery.additionalStars += 1) : (gallery.additionalStars = 1);
        },
      },
    },
  },
  {
    name: "Bridge",
    cost: 1,
    baseStars: 0,
    types: ["Culture", "Culture"],
    description: "Counts as 2 :CULTURE: buildings",
  },
  // Red Cards
  {
    name: "Workshop",
    cost: 3,
    baseStars: 2,
    types: ["Production"],
    description: "Upkeep: Gain :TOKEN:",
    hooks: {
      upkeep: {
        /**
         *
         */
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
    description: "Upkeep: Gain :TOKEN:",
    hooks: {
      upkeep: {
        /**
         *
         */
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
    description: "Upkeep: Gain :TOKEN: and choose a player to gain :TOKEN:",
    hooks: {
      upkeep: {
        /**
         *
         */
        pre: ({ player }) => {
          player.tokens += 1;
        },
        /**
         *
         */
        post: () => {
          return {
            _type: "selectPlayer",
            appliedEffect: { _type: "tokens", tokens: 1 },
          };
        },
      },
    },
  },
  {
    name: "Plant",
    cost: 5,
    baseStars: 2,
    types: ["Production"],
    description: "Upkeep: Gain :TOKEN: :TOKEN:",
    hooks: {
      upkeep: {
        /**
         *
         */
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
    description: "Upkeep: Gain :TOKEN:",
    hooks: {
      upkeep: {
        /**
         *
         */
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
    description: "Upkeep: Gain :TOKEN: :TOKEN: :TOKEN:",
    hooks: {
      upkeep: {
        /**
         *
         */
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
    description: "Upkeep: Gain :TOKEN: for each Building in your Neighbourhood",
    hooks: {
      upkeep: {
        /**
         *
         */
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
    description: "You pay :TOKEN: less at the Supplier (Minimum One)",
    hooks: {
      supply: {
        /**
         *
         */
        pre: () => {
          return { _type: "tokens", tokens: -1 };
        },
      },
    },
    effect: undefined,
  },
  {
    name: "Crane",
    cost: 2,
    baseStars: 1,
    types: ["Utility"],
    description: "You pay :TOKEN: less at the Builder",
    hooks: {
      build: {
        /**
         *
         */
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
    description: "Automatically build Plans you gain from the Supplier",
    hooks: {
      supply: {
        /**
         *
         */
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
    description: "You gain one fewer :STAR: from each :CULTURE: Building in your Neighbourhood",
    hooks: {
      turn: {
        /**
         *
         */
        post: ({ player, building }) => {
          const landfill = player.neighbourhood.buildings.find((b) => b.name === building.name);
          if (!landfill) {
            throw new Error("No Landfill object Found in Post-turn Hook");
          }
          const cultureBuildings = player.neighbourhood.buildings.filter((b) =>
            b.types.includes("Culture")
          );
          const cultureMap = cultureBuildings
            .map((b) => {
              return b.types.join(",");
            })
            .join(",")
            .split(",")
            .filter((t) => t !== "");
          landfill.additionalStars = -cultureMap.length;
        },
      },
    },
  },
  {
    name: "Vault",
    cost: 5,
    baseStars: 1,
    types: ["Utility"],
    description: ":STAR: :STAR: per Plan in your Neighbourhood",
    hooks: {
      turn: {
        /**
         *
         */
        post: ({ player, building }) => {
          const vault = player.neighbourhood.buildings.find((b) => b.name === building.name);
          if (!vault) {
            throw new Error("No Vault object Found in Post-turn Hook");
          }
          vault.additionalStars = player.neighbourhood.plans.length * 2;
        },
      },
    },
  },
  {
    name: "Obelisk",
    cost: 4,
    baseStars: 0,
    types: ["Utility"],
    description: ":STAR: per Building in your Neighbourhood",
    hooks: {
      turn: {
        /**
         *
         */
        post: ({ player, building }) => {
          const obelisk = player.neighbourhood.buildings.find((b) => b.name === building.name);
          if (!obelisk) {
            throw new Error("No Obelisk object Found in Post-turn Hook");
          }
          obelisk.additionalStars = player.neighbourhood.buildings.length;
        },
      },
    },
  },

  {
    name: "Wholesaler",
    cost: 1,
    baseStars: 1,
    types: ["Deed"],
    description: "You are the Owner of the Wholesaler location",
    hooks: {
      upkeep: {
        /**
         *
         */
        pre: ({ player, building, locations }) => {
          const wholesaler = locations.find((l) => l.name === building.name);
          if (!wholesaler) {
            throw new Error("No Wholesaler was found in upkeep phase");
          }
          if (!wholesaler.available()) {
            player.tokens += 2;
          }
        },
      },
      build: {
        /**
         *
         */
        post: ({ locations, building }) => {
          const wholesaler = locations.find((l) => l.name === building.name);
          if (!wholesaler) {
            throw new Error("NO wholesaler FOUND IN Wholesaler POST BUILD HOOK");
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
    description: "You are the Owner of the Lotto location",
    hooks: {
      upkeep: {
        /**
         *
         */
        pre: ({ player, building, locations }) => {
          const lotto = locations.find((l) => l.name === building.name);
          if (!lotto) {
            throw new Error("No Lotto was found in upkeep phase");
          }
          if (!lotto.available()) {
            player.tokens += 2;
          }
        },
      },
      build: {
        /**
         *
         */
        post: ({ locations, building }) => {
          const lotto = locations.find((l) => l.name === building.name);
          if (!lotto) {
            throw new Error("NO LOTTO FOUND IN LOTTO POST BUILD HOOK");
          }
          if (lotto.isClosed()) lotto.openLocation();
        },
      },
    },
  },
] as const satisfies ReadonlyArray<Plan>;

/**
 *
 */
export const createPlans = (customPlans?: Array<Plan> | ReadonlyArray<Plan>): Array<Plan> =>
  customPlans ? [...customPlans] : [...plans];
