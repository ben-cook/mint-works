import * as log from "https://deno.land/std@0.177.0/log/mod.ts";

log.setup({
  handlers: {
    consoleHandler: new log.handlers.ConsoleHandler("DEBUG"),
    fileHandler: new log.handlers.FileHandler("DEBUG", {
      filename: "./log.txt",
      mode: "w",
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["consoleHandler", "fileHandler"],
    },
  },
});

export const logger = log.getLogger();
