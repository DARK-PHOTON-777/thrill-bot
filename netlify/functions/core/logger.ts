import pino, { type LoggerOptions } from "pino";

const isNetlify = !!process.env.LAMBDA_TASK_ROOT;

const loggerOptions: LoggerOptions = {
	level: process.env.LOG_LEVEL || "info",
};

if (!isNetlify) {
	loggerOptions.transport = {
		target: ["pino", "pretty"].join("-"),
		options: { colorize: true },
	};
}

export const logger = pino(loggerOptions);
