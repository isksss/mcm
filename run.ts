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
    stdin: "piped",
  });

  //   serverを実行する
  const process = server.spawn();

  const { code, stdout, stderr } = await process.output();

  const writer = process.stdin.getWriter();

  const stop_cmd = config.server.stop;
  //   stop_cmdを実行する
  writer.write(new TextEncoder().encode(stop_cmd));

  //   show console stdout

  if (code === 0) {
    console.info(new TextDecoder().decode(stdout));
  } else {
    console.error(new TextDecoder().decode(stderr));
  }
}

