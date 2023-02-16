import { MintWorks } from "./mint_works.ts";
import { logger } from "./logger.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  logger.info("Initialising MintWorks...");
  const mintWorks = new MintWorks();
  mintWorks.play();
}
