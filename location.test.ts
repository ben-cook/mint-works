import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Builder } from "./location.ts";

Deno.test("Location", async (t) => {
  const location = Builder;

  await t.step("Initialises as available", () => {
    assertEquals(location.available(), true);
  });

  await t.step("Initialises with correct slots", () => {
    assertEquals(location.slots.length, 3);
    assertEquals(location.slots[0].basePrice, 2);
    assertEquals(location.slots[1].basePrice, 2);
    assertEquals(location.slots[2].basePrice, 2);
  });

  await t.step("Filling all slots makes the location unavailable", () => {
    location.slots.forEach((slot) => {
      slot.fill(3);
    });
    assertEquals(location.available(), false);
  });

  await t.step("Is available after emptying slots", () => {
    location.emptySlots();
    assertEquals(location.available(), true);
  });

  await t.step("Filling one slot of many keeps the location available", () => {
    location.slots[0].fill(3);

    assertEquals(location.available(), true);
  });
});
