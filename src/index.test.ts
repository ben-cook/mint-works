import { MintWorks, MintWorksStateManager, MintWorksTurnFactory } from ".";
import { MintWorksEngineState } from "./mint_works";
import { Turn } from "./turn";

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

describe("MintWorks", () => {
  describe("addPlayer", () => {
    it("should add a player to the game", () => {
      const mintWorks = new MintWorks();
      mintWorks.addPlayer(players[0][0]);
      expect(mintWorks.players).toHaveLength(1);
    });
  });
  describe("removePlayer", () => {
    it("should remove a player from the game", () => {
      const mintWorks = new MintWorks();
      mintWorks.addPlayer(players[0][0]);
      mintWorks.removePlayer(players[0][0].name);
      expect(mintWorks.players).toHaveLength(0);
    });
  });
  describe("createGame", () => {
    it("should create a game", () => {
      const mintWorks = new MintWorks();
      mintWorks.addPlayer(players[0][0]);
      mintWorks.addPlayer(players[1][0]);
      mintWorks.createGame();
      expect(mintWorks.gameEngine).toBeDefined();
    });
  });
});

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

function getFirstValidTurn({ state }: { state: MintWorksEngineState }): Turn {
  const mintWorksTurnFactory = new MintWorksTurnFactory({
    state,
  });
  return mintWorksTurnFactory.getTurns()[0];
}

const initialGameStateTurn = getFirstValidTurn({
  state: initialGameState,
});

const initialStateParams = {
  state: initialGameState,
  turn: initialGameStateTurn,
};

describe("MintWorksStateManager", () => {
  describe("initialising with an initial game state", () => {
    it("initialises", () => {
      const mintWorksStateManager = new MintWorksStateManager(initialStateParams);
      expect(mintWorksStateManager).toBeDefined();
    });
    it("simulates an initial turn", async () => {
      const mintWorksStateManager = new MintWorksStateManager(initialStateParams);
      const newState = await mintWorksStateManager.simulateTurn();
      expect(newState).toBeDefined();
    });
    it("returns a state with a player to take a turn", async () => {
      const mintWorksStateManager = new MintWorksStateManager(initialStateParams);
      const newState = await mintWorksStateManager.simulateTurn();
      expect(newState.playerToTakeTurn).not.toEqual(initialGameState.playerToTakeTurn);
    });
  });
  describe("with pre-simulated game state", () => {
    it("simulates a turn", async () => {
      const mintWorksStateManager = new MintWorksStateManager(initialStateParams);
      const newState = await mintWorksStateManager.simulateTurn();
      expect(newState).toBeDefined();
      const mintWorksStateManger2 = new MintWorksStateManager({
        state: newState,
        turn: getFirstValidTurn({
          state: newState,
        }),
      });
      const newState2 = await mintWorksStateManger2.simulateTurn();
      expect(newState2).toBeDefined();
    });
    it("returns a state with a different player to take a turn", async () => {
      const mintWorksStateManager = new MintWorksStateManager(initialStateParams);
      const newState = await mintWorksStateManager.simulateTurn();
      expect(newState).toBeDefined();
      const mintWorksStateManger2 = new MintWorksStateManager({
        state: newState,
        turn: getFirstValidTurn({
          state: newState,
        }),
      });

      const newState2 = await mintWorksStateManger2.simulateTurn();

      expect(newState2).toBeDefined();
      expect(newState.playerToTakeTurn).not.toEqual(newState2.playerToTakeTurn);
    });
  });
});
