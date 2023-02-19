import * as log from "https://deno.land/std@0.177.0/log/mod.ts";

log.setup({
  handlers: {
    gameConsoleHandler: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: "[GAME]   {levelName} {msg}",
    }),
    gameFileHandler: new log.handlers.FileHandler("DEBUG", {
      filename: "./log/game.log",
      mode: "w",
    }),
    playerConsoleHandler: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: "[PLAYER] {levelName} {msg}",
    }),
    playerFileHandler: new log.handlers.FileHandler("DEBUG", {
      filename: "./log/player.log",
      mode: "w",
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["gameConsoleHandler", "gameFileHandler"],
    },
    player: {
      level: "DEBUG",
      handlers: ["playerConsoleHandler", "playerFileHandler"],
    },
  },
});

export const gameLogger = log.getLogger();
export const playerLogger = log.getLogger("player");
