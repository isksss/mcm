import * as mod from "https://deno.land/std@0.208.0/toml/mod.ts";
import Logger from "./logger.ts";
import { download } from "./download.ts";
import { Logo } from "./utils.ts";

import { start } from "./run.ts";
// variables
const config_file = "mcm.toml";

export type Config = {
  server: {
    project: string;
    version: string;
    build: string;
    file: string;
  };
  develop: {
    debug: boolean;
    logfile: string;
  };
  java: {
    command: string;
    memory: string;
  };
  database: {
    name: string;
  };
};

function getConfigFile(): Config {
  // if config file does not exist
  if (!Deno.statSync(config_file)) {
    Logger.error(`Config file ${config_file} does not exist.`);
  }

  // read config file
  const config = mod.parse(Deno.readTextFileSync(config_file)) as Config;

  // return config
  return config;
}

async function main() {
  // logo
  Logo();
  // get config
  const config = getConfigFile();
  // set logger config
  Logger.setConfig(config);
  Logger.debug("Config file loaded.");
  Logger.info("Starting MCM...");

  // download server
  await download(config);

  start(config);
}

main();
