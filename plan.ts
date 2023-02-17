/** Represents a plan in the deck */
export interface Plan {
  /** The name of this plan */
  name: string;
  /** The cost (in mint tokens) of this plan */
  cost: number;
  /** The base number of stars that this plan is worth. */
  stars: number;
  /** A hook that is executed during the "upkeep" game phase */
  upkeepHook?: () => void;
  /** Other effects eg. pay less at supplier? */
  effect?: () => void;
}

/** Represents a plan that has come from the Lotto - therefore, it should be hidden to other players before it has been built */
export interface HandPlan extends Plan {
  hidden: boolean;
}

export const isHandPlan = (plan: Plan): plan is HandPlan => {
  return "hidden" in plan;
};

/** Represents a plan that has been built. Buildings are face-up for all players. */
export interface Building extends Plan {
  // deno-lint-ignore no-explicit-any
  internalState: any;
}
