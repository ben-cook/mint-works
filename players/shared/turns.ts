import { State } from "../../state.ts";
import { Turn } from "../../turn.ts";

export const generateTurns = (
  state: State,
  playerName: string,
): Array<Turn> => {
  const validTurns: Array<Turn> = [];
  const builder = state.locations.find((l) => l.name === "Builder");
  if (builder?.available()) {
    for (
      const plan of state.players.find((p) => p.label === playerName)!
        .neighbourhood.plans
    ) {
      validTurns.push({
        action: {
          _type: "Build",
          plan,
        },
        playerName,
      });
    }
  }
  return validTurns;
};
