import { State } from "../state.ts";
import { Turn } from "../turn.ts";

export class PlayerHelper {
  name;

  constructor(name: string) {
    this.name = name;
  }

  generateTurns(
    state: State,
  ): Array<Turn> {
    const validTurns: Array<Turn> = [{
      action: { "_type": "Pass" },
      playerName: this.name,
    }];

    const builder = state.locations.find((l) => l.name === "Builder");
    if (builder?.available() && this.canAffordToBuild(state)) {
      for (
        const plan of state.players.find((p) => p.label === this.name)!
          .neighbourhood.plans
      ) {
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
    if (producer?.available()) {
      validTurns.push(
        {
          action: {
            "_type": "Produce",
          },
          playerName: this.name,
        },
      );
    }

    const supplier = state.locations.find((l) => l.name === "Supplier");
    if (supplier?.available() && this.canAffordToSupply(state)) {
      for (
        const plan of state.planSupply.filter((p) =>
          p.cost <= state.players.find(
            (p) => p.label === this.name,
          )!.tokens
        )
      ) {
        validTurns.push({
          action: {
            _type: "Supply",
            plan,
          },
          playerName: this.name,
        });
      }
    }

    return validTurns;
  }

  /** Return if the player can afford to build any of their plans */
  canAffordToBuild(state: State): boolean {
    const player = this.thisPlayer(state);

    if (player.neighbourhood.getBuilding("Crane")) {
      return player.tokens >= 1;
    }

    return player.tokens >= 2;
  }

  /** Return if the player can afford to supply any of the plan supply plans */
  canAffordToSupply(state: State): boolean {
    const player = this.thisPlayer(state);
    return state.planSupply.some((p) => p.cost <= player.tokens);
  }

  /** Return this player's information from a state object */
  thisPlayer(state: State) {
    return state.players.find((p) => p.label === this.name)!;
  }
}
