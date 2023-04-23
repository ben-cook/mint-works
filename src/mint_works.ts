import { IPlayer } from "./player";
import { Turn } from "./turn";
import { gameLogger, gameLogger as logger } from "./logger";
import { State, StatePlayer } from "./state";
import { createPlans, PlanName } from "./plans";
import {
  createLocations,
  createLocationsConstructor,
  LocationCard,
  LocationConstructor,
} from "./location";
import { Neighbourhood, PublicNeighbourhood } from "./neighbourhood";
import { PlanSupply } from "./plan_supply";
import { findWinner } from "./scoring";
import { shuffleArray } from "./utils";
import { HandPlan, Plan } from "./plan";

interface PlayerInformation {
  tokens: number;
  label: string;
  age: number;
  neighbourhood: Neighbourhood;
}

export interface PlayerWithInformation extends PlayerInformation {
  player: IPlayer;
}

export interface MintWorksParams {
  players: Array<PlayerWithInformation>;
  plans?: Array<Plan>;
  locations?: Array<LocationCard>;
  deck?: Array<Plan>;
  prefilledPlanSupply?: Array<Plan>;
  preventInitialPlanSupplyRefill?: boolean;
  startingPlayerToken?: string;
  playerToTakeTurn?: string;
}

export interface MintWorksEngineState {
  locations: Array<LocationConstructor>;
  planSupply: Array<Plan>;
  numPlansInDeck: number;
  players: Array<StatePlayer>;
  roundNumber: number;
  playerToTakeTurn: string;
  startingPlayerToken: string;
  deck: Array<Plan>;
}

/**
 * The main class for the Mint Works game engine. This class is responsible for managing the game state and orchestrating the game.
 */
export class MintWorksEngine {
  roundNumber = 1;
  locations: Array<LocationCard>;
  players: Array<PlayerWithInformation>;
  planSupply: PlanSupply;
  /** The player with the starting player token starts each round in the Development phase */
  startingPlayerToken: string;
  endHook: () => void;
  playing = false;
  playerToTakeTurn: string;
  playerToTakeTurnIndex: number;
  numConsecutivePasses = 0;

  /**
   * Create a new Mint Works game
   * @param players - The players in the game
   * @param plans - The plans to use in the game
   * @param locations - The locations to use in the game
   * @param deck - The deck of plans to use in the game
   * @param prefilledPlanSupply - The plan supply to use in the game
   * @param preventInitialPlanSupplyRefill - Whether to prevent the plan supply from being refilled from the deck when it is created
   * @param endHook - The function to call when the game ends
   *
   * @remarks
   *
   * - If no plans are provided, the default plans are used.
   * - If no locations are provided, the default locations are used.
   * - If no deck is provided, a new deck is created from the plans and shuffled.
   * - If no prefilledPlanSupply is provided or if it contains fewer plans than the plan supply capacity, the plan supply is refilled from the deck until it reaches capacity. Unless preventInitialPlanSupplyRefill is true.
   * - If preventInitialPlanSupplyRefill is true, the plan supply is not refilled from the deck when it is created.
   *
   * @remarks
   *
   * preventInitialPlanSupplyRefill is used to prevent the plan supply from being refilled from the deck when the game is created. This is useful for initialising the game state in a time where the plan supply should not be refilled from the deck. For example, when the game is being initialised in the middle of the development phase.
   *
   * @example
   * Create a new game with the default plans and locations:
   * ```
   * const engine = new MintWorksEngine({
   *   players: [
   *     {
   *       player: new MyPlayer(),
   *       tokens: 3,
   *       label: "Player 1",
   *       age: 18,
   *       neighbourhood: new Neighbourhood(),
   *     },
   *     {
   *       player: new MyPlayer(),
   *       tokens: 3,
   *       label: "Player 2",
   *       age: 18,
   *       neighbourhood: new Neighbourhood(),
   *     },
   *   ],
   * });
   *```
   *
   * @example
   * Create a new game from a game state (saved in a database for example):
   * ```
   * const { players, locations, deck, prefilledPlanSupply } = await getGameStateFromDatabase();
   * const engine = new MintWorksEngine({
   *   players,
   *   locations,
   *   deck,
   *   prefilledPlanSupply,
   *   preventInitialPlanSupplyRefill: true,
   * });
   *```
   */
  constructor(
    {
      players,
      plans = createPlans(),
      locations = createLocations(),
      deck,
      prefilledPlanSupply = [],
      preventInitialPlanSupplyRefill = false,
      startingPlayerToken,
      playerToTakeTurn,
    }: MintWorksParams,
    endHook: () => void
  ) {
    // Set up players of the game
    this.players = players;
    if (!this.players || this.players.length < 1 || !this.players[0]) {
      throw new Error("No players provided to MintWorks constructor");
    }

    this.startingPlayerToken = startingPlayerToken ?? this.players[0].label;
    this.playerToTakeTurn = playerToTakeTurn ?? this.startingPlayerToken;
    this.playerToTakeTurnIndex = this.players.findIndex((p) => p.label === this.playerToTakeTurn);

    this.endHook = endHook;

    // Set up the deck of plans. If no deck is provided, create a new one from the plans and shuffle it.
    if (!deck) {
      deck = plans.slice();
      shuffleArray(deck);
    }

    this.locations = locations;

    // Set up the plan supply
    this.planSupply = new PlanSupply(deck, prefilledPlanSupply, preventInitialPlanSupplyRefill);
  }

  /**
   * Play the game until it is over.
   */
  public async play(): Promise<void> {
    // TODO: For the love of humanity, refactor this function so it isn't an infinite loop
    // eslint-disable-next-line no-constant-condition
    this.playing = true;
    while (this.playing) {
      logger.info(`Starting round ${this.roundNumber}`);
      await this.playRound();
      this.roundNumber++;
    }
  }

  /**
   * Pause the game.
   */
  public pause(): void {
    this.playing = false;
  }

  /**
   * Resume the game.
   */
  public resume(): void {
    this.playing = true;
  }

  /**
   * End the game by calling the endHook.
   */
  public async EndGame(): Promise<void> {
    return this.endHook();
  }

  /**
   * Each round consists of the Development phase followed by the Upkeep phase.
   */
  private async playRound(): Promise<void> {
    await this.development();
    await this.upkeep();
  }

  /**
   * # Development Phase
   * - The player currently holding the Starting Player Token takes the first turn.
   * - A player has two options on their turn. They may choose either the Place or Pass action. After completing one of these actions , the turn is passed clockwise to the next player.
   * - The Development phase repeats until all players consecutively pass, ending the phase. Then proceed to the Upkeep phase.
   */
  private async development(): Promise<void> {
    const numPlayers = this.players.length;
    this.numConsecutivePasses = 0;
    let i = this.players.findIndex((p) => p.label === this.startingPlayerToken);

    while (this.numConsecutivePasses < numPlayers) {
      const player = this.players[i];
      logger.info(`Player ${i}: (${player.label}'s turn)`);

      // Execute any start of turn hooks (pre-turn hooks)
      player.neighbourhood.buildings.forEach((b) => {
        if (!b.hooks?.turn?.pre) return;
        b.hooks.turn.pre({
          player,
          building: b,
          locations: this.locations,
        });
      });

      const playerState = this.getPlayerState(player);

      this.playerToTakeTurn = player.label;
      const turn = await player.player.takeTurn(playerState);

      try {
        await this.simulateTurn(turn);
      } catch (err) {
        logger.error(`Invalid turn! Error: ${err}`);
        this.EndGame();
      }

      // Execute any end of turn hooks (post-turn hooks)
      player.neighbourhood.buildings.forEach((b) => {
        if (!b.hooks?.turn?.post) return;
        b.hooks.turn.post({
          player,
          building: b,
          locations: this.locations,
        });
      });

      if (i === numPlayers - 1) {
        i = 0;
      } else {
        i++;
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
  public async upkeep(): Promise<void> {
    // If any player has seven or more stars provided by Buildings in their Neighbourhood, the game ends and Scoring takes place.
    if (this.players.some((p) => p.neighbourhood.stars() >= 7)) {
      this.scoring();
    }

    // Refill the plan supply to three face up cards from the Plan Deck. If it is not possible to completely refill the Plan Supply, the game ends and Scoring takes place.
    if (!this.planSupply.refill()) {
      this.scoring();
    }

    // Resolve all 'Upkeep' effects on Buildings.
    for (const player of this.players) {
      player.neighbourhood.buildings.forEach((b) => {
        if (!b.hooks?.upkeep?.pre) return;
        const result = b.hooks.upkeep.pre({
          player,
          building: b,
          locations: this.locations,
        });
        if (result) {
          switch (result._type) {
            case "tokensAll":
              this.players.forEach((p) => {
                p.tokens += result.tokens;
              });
              break;

            case "tokensAllOther":
              this.players.forEach((p) => {
                if (p.label === result.playerName) return;
                p.tokens += result.tokens;
              });
              break;
            default:
              break;
          }
        }
      });
    }

    // Resolve all 'Post-Upkeep' effects on Buildings.
    for (const player of this.players) {
      for (const b of player.neighbourhood.buildings) {
        if (!b.hooks?.upkeep?.post) continue;
        const result = b.hooks.upkeep.post({
          player,
          building: b,
          locations: this.locations,
        });

        if (result) {
          switch (result._type) {
            case "selectPlayer":
              {
                const selectedPlayerName = await player.player.selectPlayerForEffect(
                  result.appliedEffect,
                  this.players
                );
                const selectedPlayer = this.players.find((p) => {
                  return p.label === selectedPlayerName;
                });

                if (!selectedPlayer) {
                  throw new Error("Selected Player not found!");
                }

                switch (result.appliedEffect._type) {
                  case "tokens":
                    selectedPlayer.tokens += result.appliedEffect.tokens;
                    break;

                  default:
                    break;
                }
              }
              break;

            default:
              break;
          }
        }
      }
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
  private scoring(): void {
    const scoreboard = findWinner(this.players);
    if (scoreboard) {
      logger.info(`      NAME | STARS | HOOD | TOKENS`);
      scoreboard.scores.forEach((score) => {
        const name = score.player.label.padStart(10);
        logger.info(`${name} :   ${score.stars}       ${score.plans}        ${score.tokens}`);
      });
      logger.info(`The winner is ${scoreboard.winner}`);
    } else {
      logger.warn("No winner was found");
    }
    this.printScoreboard();
    this.EndGame();
  }

  /**
   * Generate a scoreboard for the current game
   */
  public generateScoreboard(): Array<{
    player: PlayerWithInformation;
    stars: number;
    plans: number;
    tokens: number;
  }> {
    return this.players
      .map((player) => {
        return {
          player,
          stars: player.neighbourhood.stars(),
          plans: player.neighbourhood.size(),
          tokens: player.tokens,
        };
      })
      .sort((a, b) => {
        if (a.stars > b.stars) return -1;
        else if (a.stars < b.stars) return 1;
        else {
          if (a.plans > b.plans) return -1;
          else if (a.plans < b.plans) return 1;
          else {
            return b.tokens - a.tokens;
          }
        }
      });
  }

  /**
   * Print the current scoreboard to the console
   */
  private printScoreboard(): void {
    logger.info(`      NAME | STARS | HOOD | TOKENS`);
    this.generateScoreboard().forEach((score) => {
      const name = score.player.label.padStart(10);
      logger.info(`${name} :   ${score.stars}       ${score.plans}        ${score.tokens}`);
    });
  }

  /**
   * Simulate taking a turn
   * @param turn - The turn to simulate
   */
  public async simulateTurn(turn: Turn): Promise<void> {
    logger.info(`Simulating turn for ${turn.playerName}...`, turn);

    if (turn.action._type === "Pass") {
      this.numConsecutivePasses++;
      if (this.numConsecutivePasses < this.players.length) {
        if (this.playerToTakeTurnIndex === this.players.length - 1) {
          this.playerToTakeTurnIndex = 0;
        } else {
          this.playerToTakeTurnIndex++;
        }
        this.playerToTakeTurn = this.players[this.playerToTakeTurnIndex].label;
      } else {
        this.playerToTakeTurnIndex = this.players.findIndex(
          (p) => p.label === this.startingPlayerToken
        );
        this.playerToTakeTurn = this.players[this.playerToTakeTurnIndex].label;
        await this.upkeep();
      }

      return;
    } else {
      this.numConsecutivePasses = 0;
    }

    const player = this.players.find((p) => p.label === turn.playerName);
    if (!player) throw new Error("Player not found");
    const playerTokens = player.tokens;

    const mappedLocation = this.locations.find((l) => l.mappedAction === turn.action._type);
    if (!mappedLocation) throw new Error("Location not found");

    let actionCost = "plan" in turn.action ? turn.action.plan.cost : mappedLocation.minSlotPrice();

    // Find the action type and execute appropriate pre-hooks like price calculations
    switch (turn.action._type) {
      case "Build":
        actionCost = mappedLocation.minSlotPrice();
        player.neighbourhood.buildings.forEach((b) => {
          if (!b.hooks?.build?.pre) return;
          const result = b.hooks.build.pre({
            player,
            building: b,
            locations: this.locations,
          });
          if (result) {
            switch (result._type) {
              case "tokens":
                actionCost += result.tokens;
                break;

              default:
                throw new Error("Invalid build pre hook result");
            }
          }
        });
        break;

      case "Supply":
        player.neighbourhood.buildings.forEach((b) => {
          if (!b.hooks?.supply?.pre) return;
          const result = b.hooks.supply.pre({
            player,
            building: b,
            locations: this.locations,
          });
          if (result) {
            switch (result._type) {
              case "tokens":
                actionCost += result.tokens;
                break;

              default:
                throw new Error("Invalid supply pre hook result");
            }
          }
        });
        break;

      default:
        break;
    }

    if (playerTokens < actionCost) {
      throw new Error(
        `Player ${turn.playerName} does not have sufficient tokens to ${turn.action._type}. Tokens: ${playerTokens}. Required tokens: ${actionCost}`
      );
    }

    mappedLocation.useSlot(actionCost);
    player.tokens -= actionCost;

    // Execute all the action effects and post-hooks
    switch (turn.action._type) {
      case "Build":
        {
          const plan = turn.action.plan;
          player.neighbourhood.build(plan.name as PlanName);
          player.neighbourhood.buildings.forEach((b) => {
            if (!b.hooks?.build?.post) return;
            const result = b.hooks.build.post({
              player,
              building: b,
              locations: this.locations,
            });
            if (result) {
              switch (result._type) {
                case "tokens":
                  player.tokens += result.tokens;
                  break;

                default:
                  throw new Error("Invalid build post hook result");
              }
            }
          });
        }
        break;

      case "Leadership":
        this.startingPlayerToken = turn.action.playerName;
        player.tokens += 1;
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

      case "Produce":
        player.tokens += 2;
        break;

      case "Wholesale":
        player.tokens += 2;
        break;

      case "Supply":
        {
          const plan = turn.action.plan;
          player.neighbourhood.plans.push(this.planSupply.take(plan) as HandPlan);
          player.neighbourhood.buildings.forEach((b) => {
            if (!b.hooks?.supply?.post) return;
            const result = b.hooks.supply.post({
              player,
              building: b,
              locations: this.locations,
            });
            if (result) {
              switch (result._type) {
                case "tokens":
                  player.tokens += result.tokens;
                  break;

                case "build":
                  player.neighbourhood.build(plan.name as PlanName);
                  break;

                default:
                  throw new Error("Invalid supply post hook result");
              }
            }
          });
        }
        break;

      default:
        throw new Error("Unknown action type");
    }

    if (this.numConsecutivePasses < this.players.length) {
      if (this.playerToTakeTurnIndex === this.players.length - 1) {
        this.playerToTakeTurnIndex = 0;
      } else {
        this.playerToTakeTurnIndex++;
      }
    } else {
      this.playerToTakeTurnIndex = this.players.findIndex(
        (p) => p.label === this.startingPlayerToken
      );
      this.upkeep();
    }

    this.playerToTakeTurn = this.players[this.playerToTakeTurnIndex].label;
  }

  /**
   * Get the current state of the game for a given player
   * @param playerMakingTurn - The player making the turn
   * @returns The current state of the game
   */
  private getPlayerState(playerMakingTurn: PlayerWithInformation): State {
    const players = this.players.map((anyPlayer) => {
      const isPlayerMakingTurn = playerMakingTurn.label === anyPlayer.label;
      return {
        neighbourhood: isPlayerMakingTurn
          ? playerMakingTurn.neighbourhood
          : new PublicNeighbourhood(anyPlayer.neighbourhood.getPlansAndBuildings()),
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

  /**
   *
   */
  private linkPlansAndLocations() {
    gameLogger.info("Linking locations to plans");
    for (const location of this.locations) {
      this.planSupply.deck.forEach((plan) => {
        if (plan.name === location.name) {
          gameLogger.info(`${location.name} linked to ${plan.name}`);
          plan.linkedLocation = location;
        }
      });
    }
  }

  /**
   * Construct the players for the engine state.
   * @param players - The players to construct the state for
   *
   * @returns The players for the engine state
   */
  private constructEngineStatePlayers({
    players,
  }: {
    players: Array<PlayerWithInformation>;
  }): Array<StatePlayer> {
    return players.map((player) => {
      return {
        label: player.label,
        neighbourhood: player.neighbourhood,
        tokens: player.tokens,
      };
    });
  }

  /**
   * Get the current state of the engine.
   *
   * @returns The current state of the engine.
   */
  public getEngineState(): MintWorksEngineState {
    const engineState = {
      locations: createLocationsConstructor(this.locations),
      planSupply: this.planSupply.plans,
      numPlansInDeck: this.planSupply.numPlansLeftInDeck,
      players: this.constructEngineStatePlayers({ players: this.players }),
      roundNumber: this.roundNumber,
      playerToTakeTurn: this.playerToTakeTurn,
      startingPlayerToken: this.startingPlayerToken,
      deck: this.planSupply.deck,
    } satisfies MintWorksEngineState;
    gameLogger.info("Engine state", engineState);
    return engineState;
  }
}
