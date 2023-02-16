import { MintWorks } from "./mint_works.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const mintWorks = new MintWorks();
}
