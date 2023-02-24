import { Plan } from "../plan.ts";

export const pinkPlans = [
  {
    name: "Food Bank",
    cost: 3,
    baseStars: 3,
    types: ["Utility"],
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          return {
            _type: "tokensAllOther",
            tokens: 1,
            playerName: player.label,
          };
        },
      },
    },
  },

  {
    name: "Farmer's Market",
    cost: 2,
    baseStars: 2,
    types: ["Culture"],
  },

  {
    name: "Funky Thai",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Provides 1 upkeep to a special player",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Julia") return;
          player.tokens += 1;
        },
      },
    },
  },

  {
    name: "Cafe Amazon",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Provides 1 upkeep to a special player",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Ben") return;
          player.tokens += 1;
        },
      },
    },
  },
] as const satisfies ReadonlyArray<Plan>;
