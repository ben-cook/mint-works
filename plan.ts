import { LocationCard } from "./location.ts";
import { PlayerWithInformation } from "./mint_works.ts";

/** Represents a plan in the deck */
export interface Plan {
  /** The name of this plan */
  name: string;
  /** The cost (in mint tokens) of this plan */
  cost: number;
  /** The base number of stars that this plan is worth. */
  baseStars: number;
  /** The types of the plan */
  types: ReadonlyArray<PlanType>;
  /** Descriptive plan text */
  description?: string;
  /** Other effects eg. pay less at supplier? */
  effect?: () => void;
  /** A hook that is executed before and after actions*/
  hooks?: Partial<Hooks>;
  /** The location the plan is linked to */
  linkedLocation?: LocationCard;
}

export type HookType = "supply" | "build" | "upkeep" | "turn";

export type Hooks = Record<HookType, Hook>;

export interface HookParams {
  player: PlayerWithInformation;
  locations: Array<LocationCard>;
}

export type HookEffect = { _type: "tokens"; tokens: number } | {
  _type: "build";
};

export interface Hook {
  pre?: ({ player, locations }: HookParams) => void | HookEffect;
  post?: ({ player, locations }: HookParams) => void | HookEffect;
}

/** Represents a plan that has come from the Lotto - therefore, it should be hidden to other players before it has been built */
export interface HandPlan extends Plan {
  hidden: boolean;
}

export const isHandPlan = (plan: Plan): plan is HandPlan => {
  return "hidden" in plan;
};

export const isBuilding = (plan: Plan): plan is Building => {
  return "internalState" in plan;
};

/** Represents a plan that has been built. Buildings are face-up for all players. */
export interface Building extends Plan {
  /** The additional stars from card effects */
  additionalStars?: number;
  // deno-lint-ignore no-explicit-any
  internalState: any;
}

export type PlanType = "Culture" | "Production" | "Utility" | "Deed";
