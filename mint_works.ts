import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Turn } from "./turn.ts";
import { logger } from "./logger.ts";
import { State } from "./state.ts";
import { createPlans } from "./plans.ts";
import { LocationCard } from "./location.ts";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood.ts";
import { PlanSupply } from "./plan_supply.ts";

const lowestPlansTiebreaker = false;

interface PlayerInformation {
  tokens: number;
  label: string;
  neighbourhood: Neighbourhood;
}

interface PlayerWithInformation extends PlayerInformation {
  player: Player;
}

const shuffleArray = <T>(array: Array<T>) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export class MintWorks {
  roundNumber = 1;
  locations: Array<LocationCard> = [];
  players: Array<PlayerWithInformation>;
  planSupply: PlanSupply;

  constructor() {
    // Set up players of the game
    this.players = [
      {
        player: new RandomPlayer(),
        tokens: 0,
        label: "Bob",
        neighbourhood: new Neighbourhood(),
      },
      {
        player: new RandomPlayer(),
        tokens: 0,
        label: "Alice",
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
      this.findWinner();
    }

    // Refill the plan supply to three face up cards from the Plan Deck. If it is not possible to completely refill the Plan Supply, the game ends and Scoring takes place.
    if (!this.planSupply.refill()) {
      this.findWinner();
    }

    // TODO: Remove this
    if (this.roundNumber > 4) {
      this.findWinner();
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
    this.findWinner();
    Deno.exit();
  }

  /** Finds the winner */
  public findWinner() {
    let winner;

    /** Sort the players in descending order */
    const playersDescendingStars = this.players.sort((a, b) => {
      if (a.neighbourhood.stars() > b.neighbourhood.stars()) return -1;
      else if (a.neighbourhood.stars() < b.neighbourhood.stars()) return 1;
      else return 0;
    });

    /** Identify the player/s with the highest score (index 0 is highest) */
    const playersHighestStars = playersDescendingStars.filter(
      (p) =>
        p.neighbourhood.stars() ===
          playersDescendingStars[0].neighbourhood.stars(),
    );

    /** If only 1 player has the highest score they win */
    if (playersHighestStars.length !== 1) {
      logger.info(playersHighestStars[0].label + " won!");
      winner = playersHighestStars[0].label;
    } else {
      let tiebreaker1 = [] as Array<PlayerWithInformation>;
      if (lowestPlansTiebreaker) {
        /** Tiebreaker 1 (Lowest Plans)*/
        tiebreaker1 = playersHighestStars.sort((a, b) => {
          if (a.neighbourhood.plans.length < b.neighbourhood.plans.length) {
            return -1;
          } else if (
            a.neighbourhood.plans.length > b.neighbourhood.plans.length
          ) {
            return 1;
          } else return 0;
        });
      } else {
        /** Tiebreaker 1 (Highest Plans) */
        tiebreaker1 = playersHighestStars.sort((a, b) => {
          if (a.neighbourhood.plans.length > b.neighbourhood.plans.length) {
            return -1;
          } else if (
            a.neighbourhood.plans.length < b.neighbourhood.plans.length
          ) {
            return 1;
          } else return 0;
        });
      }

      const tiebreaker1Players = tiebreaker1.filter(
        (p) =>
          p.neighbourhood.plans.length ===
            tiebreaker1[0].neighbourhood.plans.length,
      );

      /** If only 1 player has the highest plans they win */
      if (tiebreaker1Players.length === 1) {
        logger.info(tiebreaker1Players[0].label + " won!");
        winner = tiebreaker1Players[0].label;
      }
    }

    logger.info("Apparently somebody won");
    return winner;
  }

  /** Simulate taking a turn */
  private simulateTurn(turn: Turn) {
    const playerTokens = this.players[turn.playerId].tokens;
    if (turn.action._type === "Build") {
      if (playerTokens < 2) {
        throw new Error(
          `Player ${turn.playerId} does not have sufficient tokens to build. Tokens: ${playerTokens}. Required tokens: 2`,
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
