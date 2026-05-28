import type { Handler } from "@netlify/functions";
import { QuerySchema } from "../../api/schema/query";
import { getCoaster } from "./core/coasters";
import { logger } from "./core/logger";

export const handler: Handler = async (event) => {
	if (event.httpMethod !== "POST") {
		return { statusCode: 405, body: "Method not allowed" };
	}

	const body = event.body || "";

	const parsed = QuerySchema.safeParse(JSON.parse(body));

	if (!parsed.success) {
		return { statusCode: 400, body: "Invalid input" };
	}

	try {
		const response = await getCoaster(parsed.data.query);

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(response),
		};
	} catch (error) {
		logger.error(error, "LLM Error");

		return {
			statusCode: 500,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				response: "Sorry, I had an internal error.",
			}),
		};
	}
};
