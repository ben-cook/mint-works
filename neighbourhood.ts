import { Building, HandPlan, isBuilding, isHandPlan } from "./plan.ts";

export class Neighbourhood {
  public plans: Array<HandPlan | Building> = [];

  constructor(initialPlans?: Array<HandPlan | Building>) {
    this.plans = initialPlans ?? [];
  }

  public getPlan(name: string): HandPlan | Building | undefined {
    return this.plans.find((building) => building.name === name);
  }

  public addPlan(building: Building): void {
    this.plans.push(building);
  }

  public removePlan(name: string): void {
    this.plans = this.plans.filter((building) => building.name !== name);
  }

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
    this.publicPlans =
      initialPlans?.map((plan) => {
        if (isHandPlan(plan) && plan.hidden) {
          return "Hidden";
        }
        return plan;
      }) ?? [];
  }
}
