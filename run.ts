import { Config } from "./main.ts";
import Logger from "./logger.ts";

export async function start(config: Config) {
  Logger.info("Starting MC Server...");

  const cmd = config.java.command;
  const server = new Deno.Command(cmd, {
    args: [
      "-Xms" + config.java.memory,
      "-Xmx" + config.java.memory,
      "-jar",
      config.server.file,
      "nogui",
    ],
    
  });

  //   serverを実行する
  server.spawn();

  const { code, stdout, stderr } = await server.output();

  //   show console stdout

  if (code === 0) {
    console.info(new TextDecoder().decode(stdout));
  } else {
    console.error(new TextDecoder().decode(stderr));
  }
}
