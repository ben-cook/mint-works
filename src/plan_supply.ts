import { gameLogger } from "./logger";
import { Plan } from "./plan";

type Deck = Array<Plan>;

/** A PlanSupply allows players to pick plans from a selection of plans. The PlanSupply must be refilled (`refill()`) between each round.  */
export class PlanSupply {
  public static planSupplyCapacity = 3;
  public deck: Deck;
  private planSupply: Deck = [];

  /**
   * Creates a new PlanSupply with a deck of plans and a optional prefilled supply of plans.
   * @param deck - The deck of plans to draw from.
   * @param prefilledSupply - The prefilled supply of plans - if this is not provided, the plan supply will be refilled from the deck.
   *
   * @remarks
   *
   * The Plan Supply will be refilled with plans from the deck up to its capacity if the prefilled supply is not provided or if the prefilled supply is less than the capacity of the Plan Supply.
   */
  constructor(deck: Deck, prefilledSupply: Deck = [], preventInitialPlanSupplyRefill = false) {
    this.deck = deck;
    gameLogger.info(`Creating a new plan supply with ${deck.length} plans in the deck`);
    gameLogger.info(deck);

    this.planSupply = prefilledSupply;
    if (prefilledSupply) {
      gameLogger.info(`Initialising the plan supply with ${prefilledSupply.length} plans`);
      gameLogger.info(prefilledSupply);
    }

    if (!preventInitialPlanSupplyRefill) {
      gameLogger.info(`Refilling the plan supply on initialisation`);
      this.refill();
    }
  }

  /**
   * Takes a plan from the plan supply.
   * @param plan - The plan to take from the plan supply.
   */
  public take(plan: Plan) {
    const index = this.planSupply.findIndex((p) => p.name === plan.name);
    const foundPlan = this.planSupply.at(index);
    this.planSupply.splice(index, 1);
    return foundPlan;
  }

  /**
   * Refills the plan supply with plans from the top of the deck.
   *
   * @returns a boolean indicating whether or not the refill was successful
   */
  public refill(): boolean {
    gameLogger.info("plan sup len" + this.planSupply.length);
    gameLogger.info("plan sup cap" + PlanSupply.planSupplyCapacity);
    while (this.planSupply.length < PlanSupply.planSupplyCapacity) {
      const plan = this.deck.pop();
      gameLogger.info(`Refilling plan supply with ${plan?.name ?? "nothing"}`);
      if (!plan) {
        return false;
      }
      this.planSupply.push(plan);
    }
    return true;
  }

  /**
   * Draws a plan from the top of the deck. The plan is hidden.
   *
   * @returns The plan drawn from the top of the deck, or undefined if the deck is empty.
   */
  public lottoDeckDraw(): Plan | undefined {
    const plan = this.deck.pop();
    const hiddenPlan = plan ? { ...plan, hidden: true } : undefined;
    return hiddenPlan;
  }

  /**
   * Gets the plan supply plans (face-up plans in the plan supply, not the deck).
   *
   * @returns The plan supply plans
   */
  public get plans(): Deck {
    return this.planSupply;
  }

  /**
   * The number of plans in the deck (not counting face-up plans in the plan supply)
   *
   * @returns The number of plans in the deck
   */
  public get numPlansLeftInDeck(): number {
    return this.deck.length;
  }
}
