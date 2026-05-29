import pino from "pino";

const isLocal =
	process.env.NETLIFY_DEV === "true" || process.env.NODE_ENV !== "production";

export const logger = pino({
	level: process.env.LOG_LEVEL || "info",

	transport: isLocal
		? { target: "pino-pretty", options: { colorize: true } }
		: undefined,
});
