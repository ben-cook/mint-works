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

export interface LocationConstructor {
  name: string;
  type: LocationType;
  effect: string;
  slotBasePrice: number;
  numberOfSlots: number;
  startClosed?: boolean;
}

/** Location cards are where players can place mint tokens. */
export class LocationCard {
  name: string;
  type: LocationType;
  effect: string;
  slotBasePrice: number;
  numberOfSlots: number;
  slots: Slot[];

  constructor(
    { name, type, effect, slotBasePrice, numberOfSlots, startClosed = false }:
      LocationConstructor,
  ) {
    this.name = name;
    this.type = type;
    this.effect = effect;
    this.slotBasePrice = slotBasePrice;
    this.numberOfSlots = numberOfSlots;
    this.slots = [];
    if (!startClosed) this.openLocation();
  }

  public available(): boolean {
    return this.slots.some((slot) => slot.available());
  }

  public emptySlots() {
    for (const slot of this.slots) {
      slot.empty();
    }
  }

  public minSlotPrice(): number {
    return this.slots.reduce((acc, slot) => {
      if (slot.available()) {
        return Math.min(acc, slot.basePrice);
      }
      return acc;
    }, Infinity);
  }

  public openLocation(): void {
    this.slots = Array.from(
      { length: this.numberOfSlots },
      () => new Slot(this.slotBasePrice),
    );
  }

  public closeLocation(): void {
    this.slots = [];
  }

  public isOpen(): boolean {
    return this.slots?.length > 0;
  }

  public isClosed(): boolean {
    return !this.isOpen();
  }
}

export const Builder = new LocationCard(
  {
    name: "Builder",
    type: "Core",
    effect: "who knows?",
    slotBasePrice: 2,
    numberOfSlots: 3,
  },
);

export const Producer = new LocationCard(
  {
    name: "Producer",
    type: "Core",
    effect: "who knows?",
    slotBasePrice: 1,
    numberOfSlots: 3,
  },
);

export const Locations = [Builder, Producer];
