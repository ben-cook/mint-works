import { IPlayer } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Turn } from "./turn.ts";
import { gameLogger as logger } from "./logger.ts";
import { State } from "./state.ts";
import { createPlans, PlanName } from "./plans.ts";
import { LocationCard, Locations } from "./location.ts";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood.ts";
import { PlanSupply } from "./plan_supply.ts";
import { findWinner, Scoreboard } from "./scoring.ts";
import { shuffleArray } from "./utils.ts";
import { HandPlan } from "./plan.ts";

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
  /** The player with the starting player token starts each round in the Development phase */
  startingPlayerToken: string;

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

    this.startingPlayerToken = this.players[0].label;
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
    const numPlayers = this.players.length;
    let numConsecutivePasses = 0;
    let i = this.players.findIndex((p) => p.label === this.startingPlayerToken);

    while (numConsecutivePasses < numPlayers) {
      const player = this.players[i]!;
      logger.info(`Player ${i}: (${player.label}'s turn)`);

      const turn = await player.player.takeTurn(this.getPlayerState(player));
      try {
        if (turn.action._type === "Pass") {
          numConsecutivePasses++;
        } else {
          numConsecutivePasses = 0;
          this.simulateTurn(turn);
        }
      } catch (err) {
        logger.error(`Invalid turn! Error: ${err}`);
        Deno.exit(1);
      }

      i %= numPlayers;
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
  public upkeep() {
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
    for (const player of this.players) {
      player.neighbourhood.buildings.forEach((b) => {
        if (!b.upkeepHook) return;
        b.upkeepHook(player, this.locations);
      });
    }

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
    if (!scoreboard) {
      logger.info(`Round ${this.roundNumber}`);
    }
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

    const mappedLocation = this.locations.find((l) =>
      l.mappedAction === turn.action._type
    )!;

    const actionCost = "plan" in turn.action
      ? turn.action.plan.cost
      : mappedLocation.minSlotPrice();

    if (playerTokens < actionCost) {
      throw new Error(
        `Player ${turn.playerName} does not have sufficient tokens to ${turn.action._type}. Tokens: ${playerTokens}. Required tokens: ${actionCost}`,
      );
    }

    mappedLocation.useSlot(actionCost);
    player.tokens -= actionCost;

    switch (turn.action._type) {
      case "Build":
        {
          const plan = turn.action.plan;
          player.neighbourhood.build(plan.name as PlanName);

          const linkedLocation = this.locations.find((l) =>
            l.name === plan.name
          );
          if (linkedLocation && linkedLocation.isClosed()) {
            linkedLocation.openLocation();
          }
        }
        break;

      case "Leadership":
        //TODO: Implement Leadership change mechanic
        break;

      case "Lotto":
        {
          const lotto = mappedLocation;

          if (!lotto) throw new Error("Lotto location does not exist");
          if (lotto.isClosed()) throw new Error("Lotto location is closed");

          const lottoCard = this.planSupply.lottoDeckDraw();

          if (!lottoCard) {
            throw new Error("Deck is empty, lotto card can't be drawn");
          }

          player.neighbourhood.plans.push(lottoCard as HandPlan);
        }
        break;

      case "Pass":
        throw new Error("Pass action should not be handled here");

      case "Produce":
        player.tokens += 2;
        break;

      case "Supply":
        {
          player.neighbourhood.plans.push(
            this.planSupply.take(turn.action.plan) as HandPlan,
          );
        }
        break;

      default:
        throw new Error("Unknown action type");
    }
  }

  private getPlayerState(playerMakingTurn: PlayerWithInformation): State {
    const players = this.players.map((anyPlayer) => {
      const isPlayerMakingTurn = playerMakingTurn.label === anyPlayer.label;
      return {
        neighbourhood: isPlayerMakingTurn
          ? playerMakingTurn.neighbourhood
          : new PublicNeighbourhood(
            anyPlayer.neighbourhood.getPlansAndBuildings(),
          ),
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
