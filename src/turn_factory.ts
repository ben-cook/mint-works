import { MintWorksEngineState } from "./engine";
import { PlayerHelper } from "./players/player_helper";
import { Turn } from "./turn";

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
    const parsedState = this.playerHelper.parseStateFromEngineState(this.state);
    return this.playerHelper.generateTurns(parsedState);
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
