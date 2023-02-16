import { Player } from "./player.ts";
import { RandomPlayer } from "./players/random_player.ts";
import { Round } from "./round.ts";
import { Turn } from "./turn.ts";
import { logger } from "./logger.ts";
import { Building, HandPlan, isHandPlan, Plan } from "./plan.ts";
import { State } from "./state.ts";

interface PlayerInformation {
  tokens: number;
  label: string;
  neighbourhood: Array<HandPlan | Building>;
}

interface PlayerWithInformation extends PlayerInformation {
  player: Player;
}

export class MintWorks {
  roundNumber = 1;
  locations: Array<Location> = [];
  players: Array<PlayerWithInformation>;
  deck: Array<Plan> = [];
  planSupply: Array<Plan> = [];

  constructor() {
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

  public async playRound() {
    logger.info(`players: ${this.players.length}`);
    for (let i = 0; i < this.players.length; i++) {
      logger.info(`i = ${i}`);
      logger.info(this.players);
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

  public play() {
    while (!this.somebodyHasWon()) {
      logger.info(`Round ${this.roundNumber}`);
      this.playRound();
      this.roundNumber++;
    }
  }

  private somebodyHasWon() {
    return Math.random() < 0.2;
  }
}
