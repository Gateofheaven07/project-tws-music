"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeError = exports.logger = void 0;
const REDACTED = '[redacted]';
const SENSITIVE_KEY_PATTERN = /(authorization|cookie|password|token|secret|api[_-]?key|database[_-]?url)/i;
const serializeError = (error) => {
    if (error instanceof Error) {
        const serialized = {
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
        const maybeCode = error.code;
        if (maybeCode) {
            serialized.code = maybeCode;
        }
        return serialized;
    }
    return error;
};
exports.serializeError = serializeError;
const sanitize = (value) => {
    if (value instanceof Error) {
        return serializeError(value);
    }
    if (Array.isArray(value)) {
        return value.map(sanitize);
    }
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
            key,
            SENSITIVE_KEY_PATTERN.test(key) && typeof entry !== 'boolean' ? REDACTED : sanitize(entry),
        ]));
    }
    return value;
};
const write = (level, message, meta) => {
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
exports.logger = {
    info: (message, meta) => write('info', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
};
