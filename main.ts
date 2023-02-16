import { MintWorks } from "./mint_works";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const MintWorks = new MintWorks();
}
