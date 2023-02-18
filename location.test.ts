import { assertEquals } from "https://deno.land/std@0.177.0/testing/asserts.ts";
import { Builder } from "./location.ts";

Deno.test("Location", async (t) => {
  const location = Builder;

  await t.step("Initialises as available", () => {
    assertEquals(location.available(), true);
  });

  await t.step("Is available after emptying slots", () => {
    location.emptySlots();
    assertEquals(location.available(), true);
  });
});
