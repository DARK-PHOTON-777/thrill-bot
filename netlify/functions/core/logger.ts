import pino from "pino";

const prodLogger = pino({ level: process.env.LOG_LEVEL || "info" });

const devLogger = pino({
	level: "debug",
	transport: {
		target: "pino-pretty",
		options: { colorize: true },
	},
});

export const logger =
	process.env.NODE_ENV === "development" ? prodLogger : devLogger;
