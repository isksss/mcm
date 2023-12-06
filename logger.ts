import { Config } from "./main.ts";

export default class Logger {
  private static config: Config;
  private static prefix_info = "[INFO]";
  private static prefix_error = "[ERROR]";
  private static prefix_debug = "[DEBUG]";

  public static setConfig(config: Config) {
    Logger.config = config;
    Logger.write_log("#-----#-----#-----#-----#-----#-----#-----#-----#-----#");
  }

  public static info(message: string) {
    const log_txt = `${Logger.prefix_info} ${message}`;
    console.log(log_txt);
    Logger.write_log(log_txt);
  }

  public static debug(message: string) {
    const log_txt = `${Logger.prefix_debug} ${message}`;
    if (Logger.config.develop.debug) {
      console.log(log_txt);
    }
    Logger.write_log(log_txt);
  }

  public static error(message: string) {
    const log_txt = `${Logger.prefix_error} ${message}`;
    console.error(log_txt);
    Logger.write_log(log_txt);
    Deno.exit(1);
  }

  private static write_log(message: string) {
    const logfile = Logger.config.develop.logfile;
    // write log file write mode a
    Deno.writeTextFileSync(logfile, `${message}\n`, { append: true });
  }
}
