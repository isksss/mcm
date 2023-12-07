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

  const writer = process.stdin.getWriter();

  const stop_cmd = config.server.stop;
  const restart_time = config.server.restart;

  //  restart_time(分)をミリ秒に変換
  const restart_time_ms = restart_time * 60 * 1000;

  //   一定時間経過後にprocessを終了する
  Logger.info(`Stopping MC Server after ${restart_time} minutes...`);
  setTimeout(() => {
    writer.write(textEncode(stop_cmd + "\n"));
  }, restart_time_ms);

  // interval list
  const interval_list = [];

  // ログを出力する
  const is_running_log = setInterval(async () => {
    // 現在時刻を取得
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    await Logger.info(`[${hour}:${minute}:${second}] MC Server is running...`);
  }, 10 * 60 * 1000);
  interval_list.push(is_running_log);

  // 5分ごとにサーバーにコマンドを送信する
  const message_5m = setInterval(async () => {
    const message = "say This server is powered by MCM !\n";
    writer.write(textEncode(message));
  }, 5 * 60 * 1000);
  interval_list.push(message_5m);

  // webhook
  if (config.discord.enable) {
    const url = config.discord.webhook_url;
    const message = "MCM is running MC Server !\n";
    sendWebhook(url, message);
  }

  const { code } = await process.output();
  writer.close();

  // intervalを全てclearする
  for (const interval of interval_list) {
    clearInterval(interval);
  }

  if (code !== 0) {
    Logger.error("MC Server exited with code " + code);
  }

  Logger.debug(`MC Server exited with code ${code}`);
}

// textEncode function
function textEncode(text: string) {
  return new TextEncoder().encode(text);
}

// discord webhook
function sendWebhook(url: string, message: string) {
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: message,
    }),
  });
}
