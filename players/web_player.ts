import { IPlayer } from "../player";
import { Turn } from "../turn";
import { State } from "../state";
import { PlayerHelper } from "./player_helper";
import { PlayerWithInformation } from "../mint_works";
import { HookEffect } from "../plan";

export interface WebHooks {
  getTurnFromUser: (turns: Array<Turn>) => Promise<Turn>;
  getPlayerSelectionFromUser: (players: Array<string>) => Promise<string>;
}

export class WebPlayer extends PlayerHelper implements IPlayer {
  webHooks: WebHooks;

  constructor({ name, webHooks }: { name: string; webHooks: WebHooks }) {
    super(name);

    this.webHooks = webHooks;
  }

  async takeTurn(state: State): Promise<Turn> {
    const turns = this.generateTurns(state);

    const turn = await this.webHooks.getTurnFromUser(turns);
    console.log(turn);
    return new Promise((resolve, _reject) => resolve(turn));
  }

  async selectPlayerForEffect(
    appliedEffect: HookEffect,
    players: Array<PlayerWithInformation>
  ): Promise<string> {
    const playerNames = players
      .map((p) => {
        return p.label;
      })
      .filter((name) => name !== this.name);
    const selectedPlayerName = await this.webHooks.getPlayerSelectionFromUser(
      playerNames
    );
    const validPlayer = players.some((p) => p.label === selectedPlayerName);
    if (!validPlayer) throw new Error("Player not found");

    return selectedPlayerName;
  }
}
