import { Neighbourhood } from "./neighbourhood";
import { IPlayer } from "./player";

interface PlayerInformation {
  tokens: number;
  label: string;
  age: number;
  neighbourhood: Neighbourhood;
}

export interface PlayerWithInformation extends PlayerInformation {
  player: IPlayer;
}
