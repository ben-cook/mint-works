import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Round } from "./round.ts";
import { Turn } from "./turn.ts";
import { logger } from "./logger.ts";
import { Building, HandPlan, isHandPlan, Plan } from "./plan.ts";
import { State } from "./state.ts";
import { plans } from "./plans.ts";

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
  locations: Array<Location> = [];
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
        label: "Ben",
        neighbourhood: [],
      },
      {
        player: new RandomPlayer(),
        tokens: 0,
        label: "Ryan",
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
    while (!this.somebodyHasWon()) {
      logger.info(`Starting round ${this.roundNumber}`);
      logger.debug(this.planSupply);
      await this.playRound();
      this.roundNumber++;
    }
  }

  public async playRound() {
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

  private somebodyHasWon() {
    return this.roundNumber > 6;
  }

  /** Refills the plan supply with plans from the top of the deck */
  private refillPlanSupply() {
    while (this.planSupply.length < 3) {
      const plan = this.deck.pop();
      if (!plan) {
        break;
      }
      this.planSupply.push(plan);
    }
  }
}
