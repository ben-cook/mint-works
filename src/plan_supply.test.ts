import { PlanSupply } from "./plan_supply";
import { createPlans } from "./plans";
import { Plan } from "./plan";

describe("PlanSupply", () => {
  it("PlanSupply initialisation", () => {
    const plansOriginal = createPlans();
    const planSupply = new PlanSupply(createPlans());
    // Plan Supply has correct number of plans
    expect(planSupply.plans.length).toEqual(PlanSupply.planSupplyCapacity);
    // Deck has correct number of plans
    expect(planSupply.deck.length).toEqual(plansOriginal.length - PlanSupply.planSupplyCapacity);
  });

  it("PlanSupply take method", () => {
    const planSupply = new PlanSupply(createPlans());
    expect(planSupply.plans.length).toEqual(PlanSupply.planSupplyCapacity);
    planSupply.take(planSupply.plans[0]);
    expect(planSupply.plans.length).toEqual(PlanSupply.planSupplyCapacity - 1);
  });

  it("PlanSupply refill method", () => {
    const planSupply = new PlanSupply(createPlans());
    planSupply.take(planSupply.plans[0]);
    const originalDeckSize = planSupply.numPlansLeftInDeck;
    const worked = planSupply.refill();
    expect(worked).toEqual(true);
    expect(planSupply.plans.length).toEqual(PlanSupply.planSupplyCapacity);
    expect(planSupply.numPlansLeftInDeck).toEqual(originalDeckSize - 1);
  });
});
