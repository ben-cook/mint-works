import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Turn } from "./turn.ts";
import { logger } from "./logger.ts";
import { Building, HandPlan, isHandPlan, Plan } from "./plan.ts";
import { State } from "./state.ts";
import { plans } from "./plans.ts";
import { LocationCard } from "./location.ts";

interface PlayerInformation {
  tokens: number;
  label: string;
  neighbourhood: Array<HandPlan | Building>;
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
  deck: Array<Plan> = [];
  planSupply: Array<Plan> = [];
  planSupplySize = 3;

  constructor() {
    // Set up players of the game
    this.players = [
      {
        player: new RandomPlayer(),
        tokens: 0,
        label: "Bob",
        neighbourhood: [],
      },
      {
        player: new RandomPlayer(),
        tokens: 0,
        label: "Alice",
        neighbourhood: [],
      },
    ];

    // Set up the plan deck
    const deck = plans.slice();
    shuffleArray(deck);
    logger.info(deck);
    this.deck = deck;

    // Set up the plan supply
    this.refillPlanSupply();
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
  private async upkeep() {
    // If any player has seven or more stars provided by Buildings in their Neighbourhood, the game ends and Scoring takes place.
    if (this.players.some((p) => p.tokens >= 7)) {
      this.scoring();
    }

    // Refill the plan supply to three face up cards from the Plan Deck. If it is not possible to completely refill the Plan Supply, the game ends and Scoring takes place.
    if (!this.refillPlanSupply) {
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
    logger.info("Apparently somebody won");
    Deno.exit();
  }

  /** Simulate taking a turn */
  private simulateTurn(turn: Turn) {
    const playerTokens = this.players[turn.playerId].tokens;
    if (turn.action._type === "Build") {
      if (playerTokens < 2) {
        throw new Error(
          `Player ${turn.playerId} does not have sufficient tokens to build. Tokens: ${playerTokens}. Required tokens: 2`
        );
      }
    }
  }

  private getPlayerState(playerMakingTurn: PlayerWithInformation): State {
    const players = this.players.map((anyPlayer) => {
      let neighbourhood;
      const isPlayerMakingTurn = playerMakingTurn.label === anyPlayer.label;
      if (isPlayerMakingTurn) {
        // This is the current player. They are allowed to see their entire neighbourhood
        neighbourhood = playerMakingTurn.neighbourhood;
      } else {
        // We need to generate what this player can see from other player's neighbourhoods
        neighbourhood = anyPlayer.neighbourhood.map((plan) => {
          if (isHandPlan(plan) && plan.hidden) {
            return "Hidden";
          }
          return plan;
        });
      }

      return {
        neighbourhood,
        tokens: anyPlayer.tokens,
        label: anyPlayer.label,
      };
    });

    return {
      locations: this.locations,
      numPlansInDeck: this.deck.length,
      planSupply: this.planSupply,
      players,
    };
  }

  /** Refills the plan supply with plans from the top of the deck.
   * @returns a boolean indicating whether or not the refill was successful
   */
  private refillPlanSupply() {
    while (this.planSupply.length < this.planSupplySize) {
      const plan = this.deck.pop();
      if (!plan) {
        return false;
      }
      this.planSupply.push(plan);
    }
    return true;
  }
}
