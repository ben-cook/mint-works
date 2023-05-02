import { Builder } from "./location";

describe("Location", () => {
  const location = Builder;

  it("Initialises as available", () => {
    expect(location.available()).toEqual(true);
  });

  it("Initialises with correct slots", () => {
    expect(location.slots.length).toEqual(2);
    expect(location.slots[0].basePrice).toEqual(2);
    expect(location.slots[1].basePrice).toEqual(2);
  });

  it("Filling all slots makes the location unavailable", () => {
    location.slots.forEach((slot) => {
      slot.fill(3);
    });
    expect(location.available()).toEqual(false);
  });

  it("Is available after emptying slots", () => {
    location.emptySlots();
    expect(location.available()).toEqual(true);
  });

  it("Filling one slot of many keeps the location available", () => {
    location.slots[0].fill(3);

    expect(location.available()).toEqual(true);
  });

  it("Locations can be closed", () => {
    location.closeLocation();
    expect(location.isOpen()).toEqual(false);
    expect(location.isClosed()).toEqual(true);
  });

  it("Locations can be opened", () => {
    location.openLocation();
    expect(location.isOpen()).toEqual(true);
    expect(location.isClosed()).toEqual(false);
  });
});
