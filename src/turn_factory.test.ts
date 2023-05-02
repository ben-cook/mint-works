import { MintWorks } from "./state_manager";
import { Turn } from "./turn";
import { MintWorksTurnFactory } from "./turn_factory";

const players: Array<Parameters<MintWorks["addPlayer"]>> = [
  [
    {
      name: "Test Player 1",
      age: 21,
      tokens: 3,
      interactionHooks: {
        getTurnFromInterface(turns: Array<Turn>) {
          return new Promise((resolve) => resolve(turns[0]));
        },
        getPlayerSelectionFromInterface(players: Array<string>) {
          return new Promise((resolve) => resolve(players[0]));
        },
      },
    },
  ],
  [
    {
      name: "Test Player 2",
      age: 22,
      tokens: 3,
      interactionHooks: {
        getTurnFromInterface(turns: Array<Turn>) {
          return new Promise((resolve) => resolve(turns[0]));
        },
        getPlayerSelectionFromInterface(players: Array<string>) {
          return new Promise((resolve) => resolve(players[0]));
        },
      },
    },
  ],
];

// Create initial game state to test turn factory and state manager
const initialEngine = new MintWorks();
initialEngine.addPlayer(players[0][0]);
initialEngine.addPlayer(players[1][0]);
initialEngine.createGame();
const initialGameState = initialEngine.gameEngine?.getEngineState()!;

describe("MintWorksTurnFactory", () => {
  describe("getTurns", () => {
    it("should return a list of turns", () => {
      const mintWorksTurnFactory = new MintWorksTurnFactory({
        state: initialGameState,
        playerName: players[0][0].name,
      });
      const turns = mintWorksTurnFactory.getTurns();
      expect(turns.length).toBeGreaterThanOrEqual(1);
    });
  });
});
