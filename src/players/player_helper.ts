import { LocationCard, createLocationsFromState } from "../location";
import { MintWorksEngineState } from "../engine";
import { Neighbourhood } from "../neighbourhood";
import { HandPlan, Building } from "../plan";
import { addHooksToPlans } from "../plans";
import type { State, StatePlayer } from "../state";
import type { Turn } from "../turn";

/**
 * A helper class for players that provides some common functionality.
 */
export class PlayerHelper {
  name;

  /**
   * @param name - The name of the player
   */
  constructor(name: string) {
    this.name = name;
  }

  /**
   * Generate a list of valid turns for the player given the current state.
   * @param state - The current game state
   * @returns The list of valid turns
   */
  generateTurns(state: State): Array<Turn> {
    const player = state.players.find((p) => p.label === this.name);
    if (!player) throw new Error("Player not found");

    const validTurns: Array<Turn> = [
      {
        action: { _type: "Pass" },
        playerName: this.name,
      },
    ];

    const builder = state.locations.find((l) => l.name === "Builder");
    if (builder?.available() && this.canAffordToBuild(state, builder)) {
      for (const plan of player.neighbourhood.plans) {
        validTurns.push({
          action: {
            _type: "Build",
            plan,
          },
          playerName: this.name,
        });
      }
    }

    const producer = state.locations.find((l) => l.name === "Producer");
    if (producer?.available() && this.canAffordBasicLocation(state, producer)) {
      validTurns.push({
        action: {
          _type: "Produce",
        },
        playerName: this.name,
      });
    }

    const leadership = state.locations.find((l) => l.name === "Leadership");
    if (leadership?.available() && this.canAffordBasicLocation(state, leadership)) {
      validTurns.push({
        action: {
          _type: "Leadership",
          playerName: this.name,
        },
        playerName: this.name,
      });
    }

    const supplier = state.locations.find((l) => l.name === "Supplier");
    if (supplier?.available() && this.canAffordToSupply(state)) {
      for (const plan of state.planSupply.filter((p) => p.cost <= player.tokens)) {
        validTurns.push({
          action: {
            _type: "Supply",
            plan,
          },
          playerName: this.name,
        });
      }
    }

    const lotto = state.locations.find((l) => l.name === "Lotto");
    if (
      state.numPlansInDeck >= 1 &&
      lotto?.available() &&
      this.canAffordBasicLocation(state, lotto)
    ) {
      validTurns.push({
        action: {
          _type: "Lotto",
        },
        playerName: this.name,
      });
    }

    const wholesaler = state.locations.find((l) => l.name === "Wholesaler");
    if (wholesaler?.available() && this.canAffordBasicLocation(state, wholesaler)) {
      validTurns.push({
        action: {
          _type: "Wholesale",
        },
        playerName: this.name,
      });
    }

    return validTurns;
  }

  /**
   * Return if the player can afford to build a plan.
   * @param state - The current game state
   * @param builder - The builder location card
   * @returns True if the player can afford to build a plan
   */
  canAffordToBuild(state: State, builder: LocationCard): boolean {
    const player = this.thisPlayer(state);

    let cost = builder.minSlotPrice();

    if (player.neighbourhood.getBuilding("Crane")) {
      cost -= 1;
    }

    return player.tokens >= cost;
  }

  /**
   * Return if the player can afford to supply a plan.
   * @param state - The current game state
   * @returns True if the player can afford to supply a plan
   */
  canAffordToSupply(state: State): boolean {
    const player = this.thisPlayer(state);

    let costChange = 0;

    if (player.neighbourhood.getBuilding("Truck")) {
      costChange -= 1;
    }

    return state.planSupply.some((p) => p.cost + costChange <= player.tokens);
  }

  /**
   * Return if the player can afford a basic location card.
   * @param state - The current game state
   * @param location - The location card
   * @returns True if the player can afford the location card
   */
  canAffordBasicLocation(state: State, location: LocationCard): boolean {
    const player = this.thisPlayer(state);
    return player.tokens >= location.minSlotPrice();
  }

  /**
   * Return the player object for the current player.
   * @param state - The current game state
   * @returns The player object
   */
  thisPlayer(state: State): StatePlayer {
    const player = state.players.find((p) => p.label === this.name);
    if (!player) throw new Error("Player not found");
    return player;
  }

  parseStateFromEngineState(state: MintWorksEngineState): State {
    return {
      locations: createLocationsFromState(state.locations),
      planSupply: state.planSupply,
      numPlansInDeck: state.numPlansInDeck,
      players: state.players.map((p) => ({
        label: p.label,
        tokens: p.tokens,
        neighbourhood: new Neighbourhood({
          plans: addHooksToPlans(p.neighbourhood.plans) as Array<HandPlan>,
          buildings: addHooksToPlans(p.neighbourhood.buildings) as Array<Building>,
        }),
      })),
    };
  }
}
