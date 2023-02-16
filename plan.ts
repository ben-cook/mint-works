/** Represents a plan in the deck */
export interface Plan {
  cost: number;
  stars: number;
  upkeepHook: () => void;
}

/** Represents a plan that has come from the Lotto - therefore, it should be hidden to other players before it has been built */
export interface HandPlan extends Plan {
  hidden: boolean;
}

export const isHandPlan = (plan: Plan): plan is HandPlan => {
  return "hidden" in plan;
};

/** Represents a plan that has been built. Builldings are public knowledge to all players. */
export interface Building extends Plan {
  // deno-lint-ignore no-explicit-any
  internalState: any;
}
