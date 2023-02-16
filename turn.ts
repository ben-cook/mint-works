export interface Turn {
  playerId: number;
  action: Action;
}

type Action =
  | { _type: "Build"; plan: any }
  | { _type: "Produce" }
  | { _type: "Leadership" }
  | { _type: "Supply"; plan: any };
