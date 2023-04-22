import { InteractionHooks, InterfacePlayer } from "./players/interface_player";
import {
  MintWorksEngine,
  MintWorksEngineState,
  MintWorksParams,
  PlayerWithInformation,
} from "./mint_works";
import { Neighbourhood } from "./neighbourhood";
import { PlayerHelper } from "./players/player_helper";

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

/**
 * A factory to create turns for a player
 */
export class MintWorksTurnFactory {
  private playerHelper: PlayerHelper;
  private state: MintWorksEngineState;
  /**
   * Create a turn factory
   * @param playerName - The name of the player to create turns for
   * @param state - The state of the game
   *
   * @remarks
   * If no player name is provided, the player to take turn will be used. If no player to take turn is provided, the starting player token will be used.
   */
  constructor({ playerName, state }: { playerName?: string; state: MintWorksEngineState }) {
    const targetPlayerName = state.playerToTakeTurn ?? playerName ?? state.startingPlayerToken;
    if (!targetPlayerName) throw new Error("No player to take turn");

    this.state = state;
    this.playerHelper = new PlayerHelper(targetPlayerName);
  }

  /**
   * Get the turns that the player can take.
   * @returns The turns that the player can take.
   */
  public getTurns(): Array<Turn> {
    return this.playerHelper.generateTurns(this.state);
  }

  /**
   * Validate a turn for a player in a given state
   * @param turn - The turn to validate
   * @param state - The state of the game
   * @returns True if the turn is valid
   */
  public static validateTurn({
    turn,
    state,
  }: {
    turn: Turn;
    state: MintWorksEngineState;
  }): boolean {
    const turnFactory = new MintWorksTurnFactory({
      playerName: turn.playerName,
      state: state,
    });
    const turns = turnFactory.getTurns();

    return turns.map((turn) => JSON.stringify(turn)).includes(JSON.stringify(turn));
  }
}

