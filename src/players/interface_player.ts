import { IPlayer } from "../player";
import { Turn } from "../turn";
import { State } from "../state";
import { PlayerHelper } from "./player_helper";
import { PlayerWithInformation } from "../mint_works";
import { HookEffect } from "../plan";

/**
 * The hooks that the interface player uses to interact with the game.
 */
export interface InteractionHooks {
  /**
   * Get a turn from the interface
   * @param turns - The list of valid turns
   * @returns The turn that was selected
   */
  getTurnFromInterface: (turns: Array<Turn>) => Promise<Turn>;
  /**
   * Get a player selection from the interface
   * @param players - The list of players to select from
   * @returns The name of the player that was selected
   */
  getPlayerSelectionFromInterface: (players: Array<string>) => Promise<string>;
}

/**
 * A player that uses the interface to interact with the game.
 */
export class InterfacePlayer extends PlayerHelper implements IPlayer {
  interactionHooks: InteractionHooks;

  /**
   * @param name - The name of the player
   * @param interactionHooks - The hooks to use to interact with the player
   */
  constructor({ name, interactionHooks }: { name: string; interactionHooks: InteractionHooks }) {
    super(name);

    this.interactionHooks = interactionHooks;
  }

  /**
   * Take a turn by calling the getTurnFromInterface hook and returning the result
   * @param state - The current game state
   * @returns The turn that was selected
   */
  async takeTurn(state: State): Promise<Turn> {
    const turns = this.generateTurns(state);

    const turn = await this.interactionHooks.getTurnFromInterface(turns);
    console.log(turn);
    return new Promise((resolve, _reject) => resolve(turn));
  }

  /**
   * Select a player by calling the getPlayerSelectionFromInterface hook and returning the result
   * @param appliedEffect - The effect that is being applied
   * @param players - The list of players to select from
   * @returns The name of the player that was selected
   */
  async selectPlayerForEffect(
    appliedEffect: HookEffect,
    players: Array<PlayerWithInformation>
  ): Promise<string> {
    const playerNames = players
      .map((p) => {
        return p.label;
      })
      .filter((name) => name !== this.name);
    const selectedPlayerName = await this.interactionHooks.getPlayerSelectionFromInterface(
      playerNames
    );
    const validPlayer = players.some((p) => p.label === selectedPlayerName);
    if (!validPlayer) throw new Error("Player not found");

    return selectedPlayerName;
  }
}
