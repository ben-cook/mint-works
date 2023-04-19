import { PlanSupply } from "./plan_supply.ts";
import { createPlans } from "./plans.ts";
import {
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Plan } from "./plan.ts";

Deno.test("PlanSupply initialisation", () => {
  const plansOriginal = createPlans();
  const planSupply = new PlanSupply(createPlans());
  // Plan Supply has correct number of plans
  assertEquals(planSupply.plans.length, PlanSupply.planSupplyCapacity);
  // Deck has correct number of plans
  assertEquals(planSupply.deck.length, plansOriginal.length - PlanSupply.planSupplyCapacity);
  // Plan Supply initialises with the plans from the back of the deck
  assertArrayIncludes<Plan>(
    planSupply.plans,
    plansOriginal.slice(plansOriginal.length - PlanSupply.planSupplyCapacity)
  );
});

Deno.test("PlanSupply take method", () => {
  const planSupply = new PlanSupply(createPlans());
  assertEquals(planSupply.plans.length, PlanSupply.planSupplyCapacity);
  planSupply.take(planSupply.plans[0]);
  assertEquals(planSupply.plans.length, PlanSupply.planSupplyCapacity - 1);
});

Deno.test("PlanSupply refill method", () => {
  const planSupply = new PlanSupply(createPlans());
  planSupply.take(planSupply.plans[0]);
  const originalDeckSize = planSupply.numPlansLeftInDeck;
  const worked = planSupply.refill();
  assertEquals(worked, true);
  assertEquals(planSupply.plans.length, PlanSupply.planSupplyCapacity);
  assertEquals(planSupply.numPlansLeftInDeck, originalDeckSize - 1);
});
