type LogLevel = 'info' | 'warn' | 'error';

const REDACTED = '[redacted]';
const SENSITIVE_KEY_PATTERN = /(authorization|cookie|password|token|secret|api[_-]?key|database[_-]?url)/i;

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    const serialized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    const maybeCode = (error as { code?: unknown }).code;
    if (maybeCode) {
      serialized.code = maybeCode;
    }

    return serialized;
  }

  return error;
};

const sanitize = (value: unknown): unknown => {
  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) && typeof entry !== 'boolean' ? REDACTED : sanitize(entry),
      ])
    );
  }

  return value;
};

const write = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'soundwave-backend',
    ...(meta ? { meta: sanitize(meta) } : {}),
  };

  const line = JSON.stringify(payload);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
};

export { serializeError };
