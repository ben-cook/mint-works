export class Slot {
  basePrice: number;
  tokens: number;

  constructor(basePrice: number, tokens: number) {
    this.basePrice = basePrice;
    this.tokens = tokens;
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
