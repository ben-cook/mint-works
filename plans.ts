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
    hooks: {
      turn: {
        post: ({ player }) => {
          const museum = player.neighbourhood.buildings.find((b) =>
            b.name === "Museum"
          );
          if (!museum) {
            throw new Error("No Museum object Found in Post-turn Hook");
          }
          const cultureBuildings = player.neighbourhood.buildings.filter((b) =>
            b.types.includes("Culture")
          );
          const cultureMap = cultureBuildings.map((b) => {
            return b.types.join(",");
          }).join(",").split(",");
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
    hooks: {
      supply: {
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
    hooks: {
      turn: {
        post: ({ player }) => {
          const landfill = player.neighbourhood.buildings.find((b) =>
            b.name === "Landfill"
          );
          if (!landfill) {
            throw new Error("No Landfill object Found in Post-turn Hook");
          }
          const cultureBuildings = player.neighbourhood.buildings.filter((b) =>
            b.types.includes("Culture")
          );
          const cultureMap = cultureBuildings.map((b) => {
            return b.types.join(",");
          }).join(",").split(",");
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
    hooks: {
      turn: {
        post: ({ player }) => {
          const vault = player.neighbourhood.buildings.find((b) =>
            b.name === "Vault"
          );
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
    hooks: {
      turn: {
        post: ({ player }) => {
          const obelisk = player.neighbourhood.buildings.find((b) =>
            b.name === "Obelisk"
          );
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
          const wholesaler = locations.find((l) => l.name === "Wholesaler");
          if (!wholesaler) {
            throw new Error(
              "NO wholesaler FOUND IN Wholesaler POST BUILD HOOK",
            );
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
