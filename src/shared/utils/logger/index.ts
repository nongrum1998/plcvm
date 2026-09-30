/**
 * @file Client-side logger with server-side log persistence.
 *
 * In development, logs are written to the console with a formatted timestamp.
 * In production, `ERROR`, `INFO`, and `WARN` entries are sent to the server
 * via a `POST /logs` endpoint for centralised log aggregation.
 */

/** Log severity levels. */
type ErrorType = 'ERROR' | 'INFO' | 'WARN' | 'LOG';

/**
 * Sends a log entry to the server for persistence.
 *
 * @param type    - Severity level.
 * @param message - Short log message.
 * @param content - Detailed log content (serialised data or description).
 */
const sendLogToServer = async (type: ErrorType, message: string, content: string) => {
  // Log persistence is pending a `POST /logs` endpoint; the payload is
  // prepared now so the transport can be wired up without refactoring.
  void type;
  void message;
  void content;
};

/**
 * Formats log arguments into a string with timestamp and severity prefix.
 *
 * Handles single-argument (string or object) and two-argument (message + data) forms.
 *
 * @param type - Severity level.
 * @param args - One or more values to log.
 * @returns Formatted log string.
 */
const formatData = (type: ErrorType, ...args: unknown[]): string => {
  const timestamp = new Date().toISOString();
  let content: string;
  if (args.length === 1) {
    content = typeof args[0] === 'string' ? args[0] : JSON.stringify(args[0], null, 3);
  } else {
    const [message, data] = args;
    content =
      typeof message === 'string'
        ? `${message} ${data ? JSON.stringify(data, null, 3) : ''}`
        : JSON.stringify(message, null, 3);
  }
  return `[${timestamp}] [${type}]: ${content}`;
};

/**
 * Core log method — decides output based on environment.
 *
 * In development, prints formatted logs to the console.
 * In production, sends `ERROR`, `INFO`, and `WARN` to the server.
 *
 * @param type - Severity level.
 * @param args - One or more values to log.
 */
const logMethod = async (type: ErrorType, ...args: unknown[]): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatData(type, ...args));
    return;
  }

  if (!__DEV__ && type !== 'LOG') {
    try {
      let message: string;
      let content: string;

      if (args.length === 0) {
        message = '';
        content = '';
      } else if (args.length === 1) {
        if (typeof args[0] === 'string') {
          message = args[0];
          content = args[0];
        } else {
          const json = JSON.stringify(args[0]);
          message = json;
          content = json;
        }
      } else {
        const [msg, data] = args;
        message = typeof msg === 'string' ? msg : JSON.stringify(msg);
        content = JSON.stringify(data);
      }

      await sendLogToServer(type, message, content);
    } catch {
      console.log(`Failed to send ${type.toLowerCase()} logs to server`);
    }
  }
};

/**
 * Application-wide client logger.
 *
 * Provides `error`, `info`, `warn`, and `log` methods that adapt
 * behaviour based on the current environment.
 *
 * @example
 * ```ts
 * logger.error("Failed to fetch user", err);
 * logger.info("User logged in", { userId: 123 });
 * ```
 */
export const logger = {
  error: (...args: unknown[]) => logMethod('ERROR', ...args),
  info: (...args: unknown[]) => logMethod('INFO', ...args),
  warn: (...args: unknown[]) => logMethod('WARN', ...args),
  log: (...args: unknown[]) => logMethod('LOG', ...args),
};
