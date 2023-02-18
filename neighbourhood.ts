import { Building, HandPlan, isBuilding } from "./plan.ts";

export class Neighbourhood {
  public plans: Array<HandPlan | Building> = [];

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
