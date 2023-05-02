import { InteractionHooks, InterfacePlayer } from "./players/interface_player";
import {
  MintWorksEngine,
  MintWorksEngineState,
  MintWorksParams,
  PlayerWithInformation,
} from "./mint_works";
import { Neighbourhood } from "./neighbourhood";
import { Turn } from "./turn";
import { PlayerHelper } from "./players/player_helper";
import { Building, HandPlan, Plan } from "./plan";
import { LocationCard, createLocationsFromState } from "./location";
import { addHooksToPlans } from "./plans";
import { MintWorksTurnFactory } from "./turn_factory";

/**
 *
 */
export class MintWorks {
  public gameEngine?: MintWorksEngine;
  public players?: Array<PlayerWithInformation>;

  /**
   * Add a player to the game
   * @param name - The name of the player
   * @param age - The age of the player
   * @param tokens - The number of tokens the player starts with
   * @param interactionHooks - The hooks to use to interact with the player
   * @returns The player that was added
   */
  public addPlayer({
    name,
    age,
    tokens,
    interactionHooks,
  }: {
    name: string;
    age: number;
    tokens: number;
    interactionHooks: InteractionHooks;
  }): PlayerWithInformation {
    if (!this.players) this.players = [];
    const player: PlayerWithInformation = {
      label: name,
      neighbourhood: new Neighbourhood(),
      player: new InterfacePlayer({
        name,
        interactionHooks,
      }),
      tokens: tokens,
      age: age,
    };
    this.players.push(player);
    return player;
  }

  /**
   * Remove a player from the game
   * @param name - The name of the player
   * @returns The list of players that are left
   */
  public removePlayer(name: string): Array<PlayerWithInformation> {
    if (!this.players) throw new Error("No players added");
    this.players = this.players.filter((player) => player.label !== name);
    return this.players;
  }

  /**
   * Create a game
   * @returns True if the game was created
   */
  public createGame(): boolean {
    if (!this.players) throw new Error("No players added");
    this.gameEngine = new MintWorksEngine({ players: this.players }, this.deleteEngine);
    return true;
  }

  /**
   * Start the game
   * @returns True if the game was started
   */
  public startGame(): boolean {
    if (!this.gameEngine) throw new Error("No game created");
    this.gameEngine.play();
    return true;
  }

  /**
   * Delete the game engine
   * @returns True if the game engine was deleted
   */
  private deleteEngine(): boolean {
    if (!this.gameEngine) throw new Error("No game created");
    delete this.gameEngine;
    return true;
  }
}

type MintWorksStateManagerEngineParams = Required<Omit<MintWorksParams, "plans">>;

/**
 * A class to manage the state of the game.
 *
 * @remarks
 *
 * This class is used to manage the state of the game. It can simulate a given turn from any game state.
 */
export class MintWorksStateManager {
  private gameEngine?: MintWorksEngine;
  private initialState: MintWorksEngineState;
  private turn: Turn;

  /**
   * Create a game state manager
   * @param state - The state of the game
   * @param turn - The turn to simulate
   */
  constructor({ state, turn }: { state: MintWorksEngineState; turn: Turn }) {
    if (!MintWorksTurnFactory.validateTurn({ turn, state })) throw new Error("Invalid turn");
    this.initialState = state;
    this.turn = turn;
  }

  /**
   * Construct the player interaction hooks.
   * @param turn - The turn to simulate
   * @param returnStateHook - A hook to return the state of the game
   *
   * @returns The player interaction hooks
   */
  private constructPlayerInteractionHooks({ turn }: { turn: Turn }): InteractionHooks {
    return {
      /** Applies the pre-determined player turn if its their turn, otherwise return the game state using the returnStateHook */
      getTurnFromInterface: async (turns: Array<Turn>): Promise<Turn> => {
        if (turns[0].playerName === turn.playerName) {
          return turn;
        }
        return turns[0];
      },
      /** TODO: Implement a proper solution for this */
      getPlayerSelectionFromInterface: async (players: Array<string>): Promise<string> => {
        return players[0];
      },
    };
  }

  /**
   * Construct the players with information
   * @param state - The state of the game
   * @param turn - The turn to simulate
   * @param returnStateHook - A hook to return the state of the game
   *
   * @returns The players with information
   */
  private constructPlayersWithInformation({
    state,
    turn,
  }: {
    state: MintWorksEngineState;
    turn: Turn;
  }): Array<PlayerWithInformation> {
    return state.players.map((player) => {
      return {
        label: player.label,
        neighbourhood: new Neighbourhood({
          plans: addHooksToPlans(player.neighbourhood.plans) as Array<HandPlan>,
          buildings: addHooksToPlans(player.neighbourhood.buildings) as Array<Building>,
        }),
        player: new InterfacePlayer({
          name: player.label,
          interactionHooks: this.constructPlayerInteractionHooks({ turn }),
        }),
        tokens: player.tokens,
        age: 18,
      };
    });
  }

  /**
   * Construct the locations
   * @param state - The state of the game
   *
   * @returns An array of locations
   */
  private constructLocations({ state }: { state: MintWorksEngineState }): Array<LocationCard> {
    return createLocationsFromState(state.locations);
  }

  /**
   * Construct the deck
   * @param state - The state of the game
   *
   * @returns An array of plans
   */
  private constructDeck({ state }: { state: MintWorksEngineState }): Array<Plan> {
    return state.deck;
  }

  /**
   * Construct the plan supply
   * @param state - The state of the game
   *
   * @returns An array of plans
   */
  private constructPlanSupply({ state }: { state: MintWorksEngineState }): Array<Plan> {
    return addHooksToPlans(state.planSupply);
  }

  /**
   * Construct the engine params
   * @param state - The state of the game
   * @param turn - The turn to simulate
   * @param returnStateHook - A hook to return the state of the game
   *
   * @returns The engine params
   */
  private constructEngineParams({
    state,
    turn,
  }: {
    state: MintWorksEngineState;
    turn: Turn;
  }): MintWorksStateManagerEngineParams {
    return {
      players: this.constructPlayersWithInformation({ state, turn }),
      locations: this.constructLocations({ state }),
      deck: this.constructDeck({ state }),
      prefilledPlanSupply: this.constructPlanSupply({ state }),
      preventInitialPlanSupplyRefill: true,
      startingPlayerToken: state.startingPlayerToken,
      playerToTakeTurn: state.playerToTakeTurn,
      roundNumber: state.roundNumber,
      numConsecutivePasses: state.numConsecutivePasses,
    };
  }

  /**
   * Create a game
   * @param engineParams - The engine params
   */
  private createGame(engineParams: MintWorksStateManagerEngineParams): void {
    if (this.gameEngine) throw new Error("Game already created");
    this.gameEngine = new MintWorksEngine(engineParams, () => {
      delete this.gameEngine;
    });
  }

  /**
   * Simulate a turn
   *
   * @returns The state of the game after the turn has been simulated
   */
  public async simulateTurn(): Promise<MintWorksEngineState> {
    const engineParams = this.constructEngineParams({
      state: this.initialState,
      turn: this.turn,
    });

    this.createGame(engineParams);
    if (!this.gameEngine) throw new Error("No game created");

    await this.gameEngine.simulateTurn(this.turn);
    return this.gameEngine.getEngineState();
  }
}
