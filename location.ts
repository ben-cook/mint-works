import { Turn } from "./turn.ts";

/** A slot that holds tokens when the are played */
export class Slot {
  /** The price to use this token */
  basePrice: number;
  /** The number of tokens on this slot */
  tokens = 0;

  constructor(basePrice: number) {
    this.basePrice = basePrice;
  }

  /** Return if the slot is available */
  public available(): boolean {
    return this.tokens < 1;
  }

  /** Add tokens to the slot */
  public fill(n: number): void {
    this.tokens = n;
  }

  /** Empty the slot */
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
  mappedAction?: Turn["action"]["_type"];
  startClosed?: boolean;
}

/** Location cards are where players can place mint tokens. */
export class LocationCard {
  name: string;
  type: LocationType;
  effect: string;
  slotBasePrice: number;
  numberOfSlots: number;
  mappedAction?: Turn["action"]["_type"];
  slots: Slot[];

  constructor(
    {
      name,
      type,
      effect,
      slotBasePrice,
      numberOfSlots,
      startClosed = false,
      mappedAction,
    }: LocationConstructor,
  ) {
    this.name = name;
    this.type = type;
    this.effect = effect;
    this.slotBasePrice = slotBasePrice;
    this.numberOfSlots = numberOfSlots;
    this.mappedAction = mappedAction;
    this.slots = [];
    if (!startClosed) this.openLocation();
  }

  /** Return if a location has at least one free slot */
  public available(): boolean {
    return this.slots.some((slot) => slot.available());
  }

  /** Use an available slot */
  public useSlot(tokens: number): void {
    const slot = this.slots.find((s) => s.available());
    if (!slot) throw new Error("No available slots");
    slot.fill(tokens);
  }

  /** Empty all the slots */
  public emptySlots() {
    for (const slot of this.slots) {
      slot.empty();
    }
  }

  /** Return the minimum price of an available slot */
  public minSlotPrice(): number {
    return this.slots.reduce((acc, slot) => {
      if (slot.available()) {
        return Math.min(acc, slot.basePrice);
      }
      return acc;
    }, Infinity);
  }

  /** Populate the location with slots */
  public openLocation(): void {
    this.slots = Array.from(
      { length: this.numberOfSlots },
      () => new Slot(this.slotBasePrice),
    );
  }

  /** Remove slots from the location */
  public closeLocation(): void {
    this.slots = [];
  }

  /** Return if the location is open */
  public isOpen(): boolean {
    return this.slots?.length > 0;
  }

  /** Return if the location is closed */
  public isClosed(): boolean {
    return !this.isOpen();
  }
}

export const Builder = new LocationCard(
  {
    name: "Builder",
    mappedAction: "Build",
    type: "Core",
    effect: "who knows?",
    slotBasePrice: 2,
    numberOfSlots: 3,
  },
);

export const Producer = new LocationCard(
  {
    name: "Producer",
    mappedAction: "Produce",
    type: "Core",
    effect: "who knows?",
    slotBasePrice: 1,
    numberOfSlots: 3,
  },
);

export const Lotto = new LocationCard(
  {
    name: "Lotto",
    mappedAction: "Lotto",
    type: "Deed",
    effect: "who knows?",
    slotBasePrice: 3,
    numberOfSlots: 1,
    startClosed: true,
  },
);

export const Locations = [Builder, Producer, Lotto];
