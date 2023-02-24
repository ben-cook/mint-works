import { Plan } from "../plan.ts";

export const thaiPlans = [
  {
    name: "Amm",
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
    name: "Fish Market",
    cost: 2,
    baseStars: 2,
    types: ["Culture"],
  },

  {
    name: "Funky Thai",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Special",
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
    description: "Special",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Ben") return;
          player.tokens += 1;
        },
      },
    },
  },

  {
    name: "Massage Parlour",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Special",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Nat") return;
          player.tokens += 1;
        },
      },
    },
  },

  {
    name: "Eurocake Factory",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Special",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Ryan") return;
          player.tokens -= 1;
        },
      },
    },
  },

  {
    name: "Craft Brewery",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Special",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Margo") return;
          player.tokens += 10;
        },
      },
    },
  },

  {
    name: "Water Sports",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Special",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Georgie") return;
          player.tokens += 1;
        },
      },
    },
  },

  {
    name: "Beach Club",
    cost: 2,
    baseStars: 3,
    types: ["Culture"],
    description: "Special",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label !== "Vic") return;
          player.tokens += 1;
        },
      },
    },
  },
] as const satisfies ReadonlyArray<Plan>;
