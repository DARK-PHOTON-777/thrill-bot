import pino, { type LoggerOptions } from "pino";

const isNetlify = process.env.NETLIFY === "true";

const loggerOptions: LoggerOptions = {
	level: process.env.LOG_LEVEL || "info",
};

if (!isNetlify) {
	loggerOptions.transport = {
		target: "pino-pretty",
		options: { colorize: true },
	};
}

export const logger = pino(loggerOptions);
