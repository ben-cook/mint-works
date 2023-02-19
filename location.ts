/** A slot that holds tokens when the are played */
export class Slot {
  /** The price to use this token */
  basePrice: number;
  /** The number of tokens on this slot */
  tokens = 0;

  constructor(basePrice: number) {
    this.basePrice = basePrice;
  }

  public available(): boolean {
    return this.tokens < 1;
  }

  public fill(n: number): void {
    this.tokens = n;
  }

  public empty() {
    this.tokens = 0;
  }
}

export type LocationType = "Core" | "Deed" | "Advanced";

/** Location cards are where players can place mint tokens. */
export class LocationCard {
  name: string;
  type: LocationType;
  effect: string;
  slots: Slot[];

  constructor(name: string, type: LocationType, effect: string, slots: Slot[]) {
    this.name = name;
    this.type = type;
    this.effect = effect;
    this.slots = slots;
  }

  public available(): boolean {
    return this.slots.some((slot) => slot.available());
  }

  public emptySlots() {
    for (const slot of this.slots) {
      slot.empty();
    }
  }
}

const builderSlots = [new Slot(2), new Slot(2), new Slot(2)];
export const Builder = new LocationCard(
  "Builder",
  "Core",
  "who knows?",
  builderSlots,
);

export const Locations = [Builder];
