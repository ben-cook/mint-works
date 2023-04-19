import { IPlayer } from "./player";
import { Turn } from "./turn";
import { gameLogger, gameLogger as logger } from "./logger";
import { State } from "./state";
import { createPlans, PlanName } from "./plans";
import { createLocations, LocationCard } from "./location";
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
  players?: Array<PlayerWithInformation>;
  plans?: Array<Plan>;
  locations?: Array<LocationCard>;
  deck?: Array<Plan>;
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

  /**
   * Create a new Mint Works game
   * @param players - The players in the game
   * @param deck - The deck of plans to use in the game
   */
  constructor({ players, deck }: MintWorksParams, endHook: () => void) {
    if (!players || players.length < 1)
      throw new Error("Must provide players to MintWorks constructor");

    this.endHook = endHook;

    // Set up players of the game
    this.players = players;

    if (!deck) {
      const plans = createPlans();
      deck = plans.slice();
    }
    shuffleArray(deck);

    // Set up the plan deck
    this.locations = createLocations();

    // Set up the plan supply
    this.planSupply = new PlanSupply(deck);

    // TODO: investigate if this is needed anymore
    // this.linkPlansAndLocations();

    if (!this.players || this.players.length < 1 || !this.players[0]) {
      throw new Error("No players provided to MintWorks constructor");
    }

    this.startingPlayerToken = this.players[0].label;
  }

  /**
   * Play the game until it is over.
   */
  public async play(): Promise<void> {
    // TODO: For the love of humanity, refactor this function so it isn't an infinite loop
    // eslint-disable-next-line no-constant-condition
    while (true) {
      logger.info(`Starting round ${this.roundNumber}`);
      await this.playRound();
      this.roundNumber++;
    }
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
    let numConsecutivePasses = 0;
    let i = this.players.findIndex((p) => p.label === this.startingPlayerToken);

    while (numConsecutivePasses < numPlayers) {
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

      const turn = await player.player.takeTurn(playerState);

      try {
        if (turn.action._type === "Pass") {
          numConsecutivePasses++;
        } else {
          numConsecutivePasses = 0;
          this.simulateTurn(turn);
        }
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
  private simulateTurn(turn: Turn): void {
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

      case "Pass":
        throw new Error("Pass action should not be handled here");

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
}
