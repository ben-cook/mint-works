import { IPlayer } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Turn } from "./turn.ts";
import { logger } from "./logger.ts";
import { State } from "./state.ts";
import { createPlans } from "./plans.ts";
import { LocationCard, Locations } from "./location.ts";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood.ts";
import { PlanSupply } from "./plan_supply.ts";
import { findWinner, Scoreboard } from "./scoring.ts";
import { shuffleArray } from "./utils.ts";

interface PlayerInformation {
  tokens: number;
  label: string;
  age: number;
  neighbourhood: Neighbourhood;
}

export interface PlayerWithInformation extends PlayerInformation {
  player: IPlayer;
}

export class MintWorks {
  roundNumber = 1;
  locations: Array<LocationCard> = Locations;
  players: Array<PlayerWithInformation>;
  planSupply: PlanSupply;

  constructor() {
    // Set up players of the game
    this.players = [
      {
        player: new RandomPlayer("Bob"),
        tokens: 3,
        label: "Bob",
        age: 34,
        neighbourhood: new Neighbourhood(),
      },
      {
        player: new RandomPlayer("Alice"),
        tokens: 3,
        label: "Alice",
        age: 21,
        neighbourhood: new Neighbourhood(),
      },
    ];

    // Set up the plan deck
    const plans = createPlans();
    const deck = plans.slice();
    shuffleArray(deck);

    // Set up the plan supply
    this.planSupply = new PlanSupply(deck);
  }

  public async play() {
    while (true) {
      logger.info(`Starting round ${this.roundNumber}`);
      logger.debug(this.planSupply);
      await this.playRound();
      this.roundNumber++;
    }
  }

  /** Each round consists of the Development phase followed by the Upkeep phase */
  private async playRound() {
    await this.development();
    await this.upkeep();
  }

  /**
   * # Development Phase
   * - The player currently holding the Starting Player Token takes the first turn.
   * - A player has two options on their turn. They may choose either the Place or Pass action. After completing one of these actions , the turn is passed clockwise to the next player.
   * - The Development phase repeats until all players consecutively pass, ending the phase. Then proceed to the Upkeep phase.
   */
  private async development() {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i]!;
      logger.info(`Player ${i}: (${player.label}'s turn)`);

      const turn = await player.player.takeTurn(this.getPlayerState(player));
      try {
        this.simulateTurn(turn);
      } catch (err) {
        logger.error(`Invalid turn! Error: ${err}`);
      }
    }
  }

  /**
   * # Upkeep Phase
   * - If any player has seven or more stars provided by Buildings in their Neighbourhood, the game ends and Scoring takes place.
   * - Refill the plan supply to three face up cards from the Plan Deck. If it is not possible to completely refill the Plan Supply, the game ends and Scoring takes place.
   * - Resolve all 'Upkeep' effects on Buildings.
   * - If there are any Mint Tokens on Deed Locations, the Owners of those Locations gain the indicated amount of Mint Tokens from the Mint Supply.
   * - Return all Mint Tokens on Locations to the Mint Supply.
   * - Each player gains one Mint Token.
   * - Proceed to the next Development phase.
   */
  private upkeep() {
    // If any player has seven or more stars provided by Buildings in their Neighbourhood, the game ends and Scoring takes place.
    if (this.players.some((p) => p.neighbourhood.stars() >= 7)) {
      this.scoring();
    }

    // Refill the plan supply to three face up cards from the Plan Deck. If it is not possible to completely refill the Plan Supply, the game ends and Scoring takes place.
    if (!this.planSupply.refill()) {
      this.scoring();
    }

    // TODO: Remove this
    if (this.roundNumber > 4) {
      this.scoring();
    }

    // Resolve all 'Upkeep' effects on Buildings.

    // If there are any Mint Tokens on Deed Locations, the Owners of those Locations gain the indicated amount of Mint Tokens from the Mint Supply.

    // Return all Mint Tokens on Locations to the Mint Supply.
    for (const location of this.locations) {
      location.emptySlots();
    }

    // Each player gains one Mint Token.
    for (const player of this.players) {
      player.tokens++;
    }

    // Proceed to the next Development phase.
  }

  /** # Scoring
   * Decide who the winner is.
   */
  private scoring() {
    const scoreboard = findWinner(this.players);
    if (scoreboard) {
      logger.info(`The winner is ${scoreboard.winner}`);
      logger.info(`      NAME | STARS | PLANS | TOKENS`);
      scoreboard.scores.forEach((score) => {
        const name = score.player.label.padStart(10);
        logger.info(
          `${name} :   ${score.stars}       ${score.plans}        ${score.tokens}`,
        );
      });
    } else {
      logger.warning("No winner was found");
    }
    this.printScoreboard();
    Deno.exit();
  }

  private printScoreboard(scoreboard?: Scoreboard) {
    if (!scoreboard) 
    logger.info(`Round ${this.roundNumber}`);
    logger.info(`      NAME | STARS | PLANS | TOKENS`);
    this.players.forEach((player) => {
      const name = player.label.padStart(10);
      logger.info(
        `${name} :   ${player.neighbourhood.stars()}       ${player.neighbourhood.plans.length}        ${player.tokens}`,
      );
    });
  }

  /** Simulate taking a turn */
  private simulateTurn(turn: Turn) {
    const player = this.players.find((p) => p.label === turn.playerName)!;
    const playerTokens = player.tokens;

    if (turn.action._type === "Build") {
      if (playerTokens < 2) {
        throw new Error(
          `Player ${turn.playerName} does not have nufficient tokens to build. Tokens: ${playerTokens}. Required tokens: 2`,
        );
      }
    }
  }

  private getPlayerState(playerMakingTurn: PlayerWithInformation): State {
    const players = this.players.map((anyPlayer) => {
      const isPlayerMakingTurn = playerMakingTurn.label === anyPlayer.label;
      return {
        neighbourhood: isPlayerMakingTurn
          ? playerMakingTurn.neighbourhood
          : new PublicNeighbourhood(anyPlayer.neighbourhood.plans),
        tokens: anyPlayer.tokens,
        label: anyPlayer.label,
      };
    });

    return {
      locations: this.locations,
      numPlansInDeck: this.planSupply.numPlansLeftInDeck,
      planSupply: this.planSupply.plans,
      players,
    };
  }
}
