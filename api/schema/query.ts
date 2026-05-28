import { z } from "zod";

export const QuerySchema = z.object({
	query: z
		.string()
		.min(3, "Query must be at least 3 characters")
		.max(200, "Query too long"),
});
