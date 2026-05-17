import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type LogMeta = Record<string, unknown>;

const logFile = process.env.LOG_FILE || resolve(process.cwd(), "logs", "qurbanir-haat.server.log");
let patched = false;

function formatValue(value: unknown): unknown {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}

function write(level: "info" | "warn" | "error", message: string, meta?: LogMeta) {
  try {
    mkdirSync(dirname(logFile), { recursive: true });
    appendFileSync(
      logFile,
      `${new Date().toISOString()} ${level.toUpperCase()} ${message}${
        meta ? ` ${JSON.stringify(formatValue(meta))}` : ""
      }\n`,
      "utf8",
    );
  } catch {
    // Logging should never take down the app.
  }
}

export function logInfo(message: string, meta?: LogMeta) {
  write("info", message, meta);
}

export function logWarn(message: string, meta?: LogMeta) {
  write("warn", message, meta);
}

export function logError(message: string, error?: unknown, meta?: LogMeta) {
  write("error", message, { ...meta, error: formatValue(error) });
}

export function patchConsoleLogging() {
  if (patched) return;
  patched = true;

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);

  console.error = (...args: unknown[]) => {
    write("error", "console.error", { args: args.map(formatValue) });
    originalError(...args);
  };

  console.warn = (...args: unknown[]) => {
    write("warn", "console.warn", { args: args.map(formatValue) });
    originalWarn(...args);
  };
}
