import pino from "pino";

export const logger = pino({
	// "debug" level captures everything; change to "info" or "error" in production
	level: process.env.LOG_LEVEL || "debug",
	// Makes local console outputs beautiful and readable instead of raw JSON strings
	transport:
		process.env.NODE_ENV !== "production"
			? { target: "pino-pretty" }
			: undefined,
});
