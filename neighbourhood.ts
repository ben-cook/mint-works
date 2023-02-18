import { Building, HandPlan, isBuilding, isHandPlan } from "./plan.ts";

export class Neighbourhood {
  public plans: Array<HandPlan | Building> = [];

  constructor(initialPlans?: Array<HandPlan | Building>) {
    this.plans = initialPlans ?? [];
  }

  /** Search for a plan by name and return it if it exists */
  public getPlan(name: string): HandPlan | Building | undefined {
    return this.plans.find((plan) => plan.name === name);
  }

  /** Add a plan to the neighbourhood */
  public addPlan(plan: HandPlan | Building): void {
    this.plans.push(plan);
  }

  /** Remove a plan from the neighbourhood */
  public removePlan(name: string): void {
    this.plans = this.plans.filter((plan) => plan.name !== name);
  }

  /** Calculate the current stars in the neighbourhood */
  public stars(): number {
    return this.plans.reduce((sum, plan) => {
      if (isBuilding(plan)) {
        return sum + (plan.baseStars ?? 0) + (plan.additionalStars ?? 0);
      }
      return sum;
    }, 0);
  }
}

export class PublicNeighbourhood extends Neighbourhood {
  publicPlans: Array<HandPlan | Building | "Hidden">;

  constructor(initialPlans?: Array<HandPlan | Building>) {
    super(initialPlans);
    this.publicPlans = initialPlans?.map((plan) => {
      if (isHandPlan(plan) && plan.hidden) {
        return "Hidden";
      }
      return plan;
    }) ?? [];
  }
}
