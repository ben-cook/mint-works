import { Building, HandPlan, isHandPlan } from "./plan.ts";
import { createPlans } from "./plans.ts";

export class Neighbourhood {
  public plans: Array<HandPlan> = [];

  public buildings: Array<Building> = [];

  /** Search for a plan by name and return it if it exists */
  public getPlan(name: string): HandPlan | undefined {
    return this.plans.find((plan) => plan.name === name);
  }

  /** Search for a building by name and return it if it exists */
  public getBuilding(name: string): Building | undefined {
    return this.buildings.find((plan) => plan.name === name);
  }

  /** Add a plan to the neighbourhood */
  public addPlan(name: string, hidden?: boolean): void {
    const plans = createPlans();
    const plan = (plans.find((p) => p.name === name)) as HandPlan | undefined;
    if (!plan) throw new Error("Plan not found" + name);

    const handPlan = {
      ...plan,
      hidden: hidden ?? false,
    } as HandPlan;
    this.plans.push(handPlan);
  }

  /** Remove a plan from the neighbourhood */
  public removePlan(name: string): void {
    this.plans = this.plans.filter((plan) => plan.name !== name);
  }

  /** Remove a building from the neighbourhood */
  public removeBuilding(name: string): void {
    this.buildings = this.buildings.filter((building) =>
      building.name !== name
    );
  }

  /** Convert a plan into a building */
  public build(name: string): void {
    const plan = this.getPlan(name);
    if (plan) {
      const building = {
        ...plan,
        additionalStars: 0,
        internalState: {},
      } as Building;
      this.removePlan(plan.name);
      this.buildings.push(building);
    }
  }

  /** Calculate the current stars in the neighbourhood */
  public stars(): number {
    return this.buildings
      .reduce(
        (total, plan) => total + plan.baseStars + (plan.additionalStars ?? 0),
        0,
      );
  }
}

export class PublicNeighbourhood extends Neighbourhood {
  publicPlans: Array<HandPlan | Building | "Hidden">;

  constructor(initialPlans?: Array<HandPlan | Building>) {
    super();
    this.publicPlans = initialPlans?.map((plan) => {
      if (isHandPlan(plan) && plan.hidden) {
        return "Hidden";
      }
      return plan;
    }) ?? [];
  }
}
