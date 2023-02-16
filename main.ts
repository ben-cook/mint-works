import { MintWorks } from "./mint_works.ts";
import * as log from "https://deno.land/std/log/mod.ts";

log.setup({});

const logger = log.getLogger();

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if (import.meta.main) {
  logger.info("Initialising MintWorks...");
  const mintWorks = new MintWorks();
  mintWorks.play();
}
