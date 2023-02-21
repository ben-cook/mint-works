import { Plan } from "./plan.ts";

type Deck = Array<Plan>;

/** A PlanSupply allows players to pick plans from a selection of plans. The PlanSupply must be refilled (`refill()`) between each round.  */
export class PlanSupply {
  public static planSupplyCapacity = 3;
  public deck: Deck;
  private planSupply: Deck = [];

  /** Creates a new `PlanSupply`.
   *
   * The `deck` is used as-is, so for a real game the deck should be shuffled before the `PlanSupply` is instantiated.
   */
  constructor(deck: Deck) {
    this.deck = deck;
    this.refill();
  }

  /** Takes a plan from the plan supply */
  public take(plan: Plan) {
    const index = this.planSupply.findIndex((p) => p.name === plan.name);
    const foundPlan = this.planSupply.at(index);
    this.planSupply.splice(index, 1);
    return foundPlan;
  }

  /** Refills the plan supply with plans from the top of the deck.
   * @returns a boolean indicating whether or not the refill was successful
   */
  public refill() {
    while (this.planSupply.length < PlanSupply.planSupplyCapacity) {
      const plan = this.deck.pop();
      if (!plan) {
        return false;
      }
      this.planSupply.push(plan);
    }
    return true;
  }

  public lottoDeckDraw(): Plan | undefined {
    const plan = this.deck.pop();
    const hiddenPlan = plan ? { ...plan, hidden: true } : undefined;
    return hiddenPlan;
  }

  public get plans() {
    return this.planSupply;
  }

  /** The number of plans in the deck (not counting face-up plans in the plan supply) */
  public get numPlansLeftInDeck() {
    return this.deck.length;
  }
}
