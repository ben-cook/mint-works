import { playerLogger } from "../logger.ts";
import { Plan } from "../plan.ts";

export const thaiPlans = [
  {
    name: "Villa Manager Amm",
    cost: 2,
    baseStars: 2,
    types: ["Utility"],
    description: "Upkeep: :TOKEN: for all",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          return {
            _type: "tokensAll",
            tokens: 1,
            playerName: player.label,
          };
        },
      },
    },
  },

  {
    name: "Raja Pier",
    cost: 4,
    baseStars: 1,
    types: ["Production"],
    description: "Lose :STAR: per plan, upkeep: 1.5 * current :TOKEN:",
    hooks: {
      turn: {
        post: ({ player, building }) => {
          const pier = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!pier) {
            throw new Error("No Raja Pier object Found in Post-turn Hook");
          }
          pier.additionalStars = -player.neighbourhood.plans.length;
        },
      },
      upkeep: {
        pre: ({ player }) => {
          player.tokens = Math.ceil(player.tokens * 1.5);
        },
      },
    },
  },

  {
    name: "Marine Park",
    cost: 3,
    baseStars: 1,
    types: ["Culture"],
    description: "Upkeep: :TOKEN: per :STAR::STAR:⭐",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += Math.floor(player.neighbourhood.stars() / 2);
        },
      },
    },
  },

  {
    name: "Funky Thai",
    cost: 3,
    baseStars: 3,
    types: ["Culture"],
    description:
      "Upkeep for 2 rounds: Lose :TOKEN::TOKEN: & :STAR:. Becomes STATUE after.",
    hooks: {
      upkeep: {
        pre: ({ player, building }) => {
          if (player.label === "Julia") player.tokens += 2;
          player.tokens -= 2;
          const thai = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );

          if (!thai) {
            throw new Error("No Funky Thai object Found in Post-turn Hook");
          }
          thai.additionalStars
            ? thai.additionalStars -= 0
            : thai.additionalStars = -2;

          if (thai.additionalStars < -2) {
            player.neighbourhood.buildings = player.neighbourhood.buildings
              .filter((b) => b.name !== building.name);
            player.neighbourhood.addBuilding("Statue");
            player.tokens += 4;
            playerLogger.info(
              "Funky Thai has been demolished! 4 tokens have been added to your stash. Keilor is a sad place without it.",
            );
          }
        },
      },
    },
  },

  {
    name: "Fisherman's Village Market",
    cost: 3,
    baseStars: 3,
    types: ["Utility"],
    description:
      "Lose :STAR: per 2 buildings \n Upkeep:Gain :TOKEN: per 2 buildings",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          player.tokens += Math.floor(
            player.neighbourhood.buildings.length / 2,
          );
        },
      },
      turn: {
        post: ({ player, building }) => {
          const fish = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!fish) {
            throw new Error(
              "No Fisherman's Village Market object Found in Post-turn Hook",
            );
          }
          fish.additionalStars = Math.floor(
            -player.neighbourhood.buildings.length / 2,
          );
        },
      },
    },
  },

  {
    name: "Café Amazon",
    cost: 1,
    baseStars: 0,
    types: ["Deed"],
    description: "Upkeep: Brown :TOKEN: if Ben",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label === "Ben") player.tokens += 1;
        },
      },
    },
  },

  {
    name: "Massage Parlour",
    cost: 3,
    baseStars: 0,
    types: ["Culture"],
    description:
      "Lose all and gain no :TOKEN: until end of next development phase. :STAR::STAR:STAR:STAR: gained at end",
    hooks: {
      turn: {
        pre: ({ player }) => {
          player.tokens = 0;
        },
        post: ({ player, building }) => {
          player.tokens = 0;
          const massageParlour = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!massageParlour) {
            throw new Error(
              "No Massage Parlour Found in Post Turn Hook - Blame RYAN",
            );
          }

          if (
            !massageParlour.additionalStars
          ) {
            massageParlour.additionalStars = 0;
          }
        },
      },
      upkeep: {
        pre: ({ player, building }) => {
          const massageParlour = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!massageParlour) {
            throw new Error(
              "No Massage Parlour Found in Upkeep Hook - Blame RYAN",
            );
          }

          if (
            massageParlour.additionalStars &&
            massageParlour.additionalStars >= 3
          ) {
            massageParlour.additionalStars = 4;
            massageParlour.hooks = undefined;
            if (player.label === "Nat") player.tokens += 2;
          }

          massageParlour.additionalStars
            ? massageParlour.additionalStars += 1
            : massageParlour.additionalStars = 0;
        },
        post: ({ player }) => {
          player.tokens = 0;
        },
      },
    },
  },

  {
    name: "Eurocake Factory",
    cost: 1,
    baseStars: 2,
    types: ["Production"],
    description: "Upkeep: Lose :TOKEN: / Gain :TOKEN: if Ryan ",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label === "Ryan") player.tokens += 2;
          if (player.tokens > 0) player.tokens -= 1;
        },
      },
    },
  },

  {
    name: "Craft Brewery",
    cost: 2,
    baseStars: 2,
    types: ["Utility"],
    description: "Upkeep: Gain :TOKEN: if Margo or Ben",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label === "Margo" || player.label === "Ben") {
            player.tokens += 1;
          }
        },
      },
    },
  },

  {
    name: "Water Sports",
    cost: 2,
    baseStars: 2,
    types: ["Utility"],
    description: "Upkeep: Gain :TOKEN: if Georgie",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label === "Georgie") player.tokens += 1;
        },
      },
    },
  },

  {
    name: "Beach Club",
    cost: 2,
    baseStars: 2,
    types: ["Culture"],
    description: "Upkeep: Gain :TOKEN: if Vic",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label === "Vic") player.tokens += 1;
        },
      },
    },
  },

  {
    name: "7/11",
    cost: 3,
    baseStars: 1,
    types: ["Utility"],
    description: "Upkeep: :STAR: for :TOKEN::TOKEN::TOKEN:",
    hooks: {
      turn: {
        post: ({ player, building }) => {
          const store = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!store) {
            throw new Error("No 7/11 Found in Upkeep Hook - Blame RYAN");
          }
          store.additionalStars = Math.floor(player.tokens / 3);
        },
      },
    },
  },

  {
    name: "Unstable Electrical Grid",
    cost: 1,
    baseStars: 0,
    types: ["Utility"],
    description:
      ":TOKEN::TOKEN:TOKEN: with Amm & Lose :TOKEN::TOKEN: With Air Con. Upkeep: 25% chance of Blackout (-20:STAR:)",
    hooks: {
      turn: {
        post: ({ player, building }) => {
          const unstableGrid = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!unstableGrid) {
            throw new Error(
              "No Unstable Electrical Grid object Found in Post-turn Hook",
            );
          }
          let blackoutStars = 0;
          if (player.neighbourhood.buildings.some((b) => b.name === "Amm")) {
            blackoutStars += 3;
          }
          if (
            player.neighbourhood.buildings.some((b) =>
              b.name === "Air Conditioner"
            )
          ) {
            blackoutStars -= 2;
          }

          unstableGrid.additionalStars = blackoutStars;
        },
      },
      upkeep: {
        pre: ({ player, building }) => {
          const unstableGrid = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!unstableGrid) {
            throw new Error(
              "No Unstable Electrical Grid object Found in Upkeep Hook",
            );
          }

          if (Math.random() < 0.25) {
            unstableGrid.additionalStars = -20;
          } else {
            unstableGrid.additionalStars = 0;
          }
        },
      },
    },
  },

  {
    name: "Electrical Grid",
    cost: 3,
    baseStars: 3,
    types: ["Utility"],
    description:
      "Lose :STAR: with Air Con. Upkeep: 5% chance of Blackout (-10:STAR:)",
    hooks: {
      turn: {
        post: ({ player, building }) => {
          const grid = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!grid) {
            throw new Error(
              "No Electrical Grid object Found in Post-turn Hook",
            );
          }

          if (
            player.neighbourhood.buildings.some((b) => b.name === building.name)
          ) {
            grid.additionalStars
              ? grid.additionalStars -= 1
              : grid.additionalStars = 0;
          }
        },
      },
      upkeep: {
        pre: ({ player, building }) => {
          const grid = player.neighbourhood.buildings.find((b) =>
            b.name === building.name
          );
          if (!grid) {
            throw new Error("No Electrical Grid object Found in Upkeep Hook");
          }

          if (Math.random() < 0.10) {
            grid.additionalStars = -10;
          } else {
            grid.additionalStars = 0;
          }
        },
      },
    },
  },

  {
    name: "Air Conditioner",
    cost: 2,
    baseStars: 2,
    types: ["Utility"],
    description: "Upkeep: :TOKEN: or :TOKEN::TOKEN: if Nat/Julia",
    hooks: {
      upkeep: {
        pre: ({ player }) => {
          if (player.label === "Julia" || player.label === "Nat") {
            player.tokens += 1;
          }
          player.tokens += 1;
        },
      },
    },
  },
] as const satisfies ReadonlyArray<Plan>;
