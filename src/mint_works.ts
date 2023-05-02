import { MintWorksEngine } from "./engine";
import { Neighbourhood } from "./neighbourhood";
import { InteractionHooks, InterfacePlayer } from "./players/interface_player";
import { PlayerWithInformation } from "./types";

/**
 * An engine interface class for the Mint Works game engine.
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
