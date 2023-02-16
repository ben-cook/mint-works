interface Plan {
  cost: number;
  stars: number;
  // deno-lint-ignore no-explicit-any
  internalState: any;
  upkeepHook: () => void;
}
