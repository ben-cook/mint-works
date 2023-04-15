import { MintWorksEngine, PlayerWithInformation } from "./mint_works";
import { Neighbourhood } from "./neighbourhood";
import { WebHooks, WebPlayer } from "./players/web_player";

/**
 *
 */
export class MintWorks {
  gameEngine?: MintWorksEngine;
  players?: Array<PlayerWithInformation>;
  webHooks: WebHooks;

  /**
   *
   */
  constructor({ webHooks }: { webHooks: WebHooks }) {
    this.webHooks = webHooks;
  }

  /**
   *
   */
  addPlayer({ name, age }: { name: string; age: number }): boolean {
    if (!this.players) this.players = [];
    this.players.push({
      label: name,
      neighbourhood: new Neighbourhood(),
      player: new WebPlayer({
        name: name,
        webHooks: this.webHooks,
      }),
      tokens: 3,
      age: age,
    });
    return true;
  }

  /**
   *
   */
  createGame(): boolean {
    if (!this.players) return false;
    this.gameEngine = new MintWorksEngine({ players: this.players }, this.endGame);
    return true;
  }

  /**
   *
   */
  startGame(): boolean {
    if (!this.gameEngine) return false;
    this.gameEngine.play();
    return true;
  }

  /**
   *
   */
  endGame() {
    console.log("Game over!");
    delete this.gameEngine;
  }
}
