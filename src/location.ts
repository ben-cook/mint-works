import { gameLogger } from "./logger";
import { Turn } from "./turn";

/** A slot that holds tokens when the are played */
export class Slot {
  /** The price to use this token */
  basePrice: number;
  /** The number of tokens on this slot */
  tokens: number;

  /**
   *
   */
  constructor(basePrice: number, tokens = 0) {
    this.basePrice = basePrice;
    this.tokens = tokens;
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
  public empty(): void {
    this.tokens = 0;
  }
}

export type LocationType = "Core" | "Deed" | "Advanced";

export interface LocationConstructor {
  name: string;
  type: LocationType;
  effect: string;
  ownerUpkeep?: string;
  numberOfPlayers: number;
  slotBasePrice: number;
  numberOfSlots: number;
  numberOfSlotsFourPlayers?: number;
  mappedAction?: Turn["action"]["_type"];
  startClosed?: boolean;
  startingSlots?: Array<{ basePrice: number; token: number }>;
}

/** Location cards are where players can place mint tokens. */
export class LocationCard {
  name: string;
  type: LocationType;
  effect: string;
  ownerUpkeep?: string;
  slotBasePrice: number;
  numberOfSlots: number;
  mappedAction?: Turn["action"]["_type"];
  slots: Slot[];

  /**
   *
   */
  constructor({
    name,
    type,
    effect,
    ownerUpkeep,
    slotBasePrice,
    numberOfSlots,
    numberOfSlotsFourPlayers,
    numberOfPlayers = 2,
    startClosed = false,
    mappedAction,
    startingSlots,
  }: LocationConstructor) {
    this.name = name;
    this.type = type;
    this.effect = effect;
    this.ownerUpkeep = ownerUpkeep;
    this.slotBasePrice = slotBasePrice;
    this.numberOfSlots =
      numberOfPlayers < 4 ? numberOfSlots : numberOfSlotsFourPlayers ?? numberOfSlots;
    this.mappedAction = mappedAction;
    this.slots = [];
    if (!startClosed)
      this.openLocation(
        startingSlots
          ? startingSlots.map((slot) => new Slot(slot.basePrice, slot.token))
          : undefined
      );
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
  public emptySlots(): void {
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
  public openLocation(slots?: Array<Slot>): void {
    gameLogger.info(`${this.name} has opened`);
    this.slots =
      slots ?? Array.from({ length: this.numberOfSlots }, () => new Slot(this.slotBasePrice));
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

export const Builder = {
  name: "Builder",
  mappedAction: "Build",
  type: "Core",
  effect: "Build one of your Plans",
  slotBasePrice: 2,
  numberOfSlots: 2,
  numberOfSlotsFourPlayers: 3,
} satisfies Omit<LocationConstructor, "numberOfPlayers">;

export const Supplier = {
  name: "Supplier",
  mappedAction: "Supply",
  type: "Core",
  effect: "Get a Plan from the Plan Supply",
  slotBasePrice: Infinity,
  numberOfSlots: 2,
  numberOfSlotsFourPlayers: 3,
} satisfies Omit<LocationConstructor, "numberOfPlayers">;

export const Producer = {
  name: "Producer",
  mappedAction: "Produce",
  type: "Core",
  effect: "Gain :TOKEN: :TOKEN:",
  slotBasePrice: 1,
  numberOfSlots: 2,
  numberOfSlotsFourPlayers: 3,
} satisfies Omit<LocationConstructor, "numberOfPlayers">;

export const Lotto = {
  name: "Lotto",
  mappedAction: "Lotto",
  type: "Deed",
  effect: "Gain the top Plan from the Plan Deck",
  ownerUpkeep: "Upkeep: If occupied. Gain :TOKEN:",
  slotBasePrice: 3,
  numberOfSlots: 1,
  startClosed: true,
} satisfies Omit<LocationConstructor, "numberOfPlayers">;

export const Wholesaler = {
  name: "Wholesaler",
  mappedAction: "Wholesale",
  type: "Deed",
  effect: "Gain :TOKEN: :TOKEN:",
  ownerUpkeep: "Upkeep: If occupied. Gain :TOKEN:",
  slotBasePrice: 1,
  numberOfSlots: 1,
  startClosed: true,
} satisfies Omit<LocationConstructor, "numberOfPlayers">;

export const Leadership = {
  name: "Leadership",
  mappedAction: "Leadership",
  type: "Deed",
  effect: "Take the Starting Player Token and gain :TOKEN:",
  slotBasePrice: 1,
  numberOfSlots: 1,
} satisfies Omit<LocationConstructor, "numberOfPlayers">;

export const Locations = [Builder, Supplier, Producer, Lotto, Wholesaler, Leadership];

/**
 * Create a new array of locations
 *
 * @param customLocations - An array of custom locations
 * @param numberOfPlayers - The number of players in the game
 */
export const createLocations = (
  numberOfPlayers: number,
  customLocations?: Array<Omit<LocationConstructor, "numberOfPlayers">>
): Array<LocationCard> => {
  const locations = customLocations ? customLocations : Locations;
  return locations.map((location) => new LocationCard({ numberOfPlayers, ...location }));
};

export const createLocationsFromState = (state: Array<LocationConstructor>): Array<LocationCard> =>
  state.map((location) => new LocationCard(location));

export const createLocationsConstructor = (
  numberOfPlayers: number,
  locations: Array<LocationCard>
): Array<LocationConstructor> => {
  return locations.map((location) => ({
    name: location.name,
    type: location.type,
    effect: location.effect,
    ownerUpkeep: location.ownerUpkeep,
    slotBasePrice: location.slotBasePrice,
    numberOfSlots: location.numberOfSlots,
    mappedAction: location.mappedAction,
    numberOfPlayers,
    startingSlots: location.slots.map((slot) => ({
      basePrice: slot.basePrice,
      token: slot.tokens,
    })),
  }));
};
