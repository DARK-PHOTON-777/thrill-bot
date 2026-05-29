import { z } from "zod";
import { filterSchema } from "./filter.ts";
import { sortSchema } from "./sort.ts";

export const searchSchema = z.object({
	filter: filterSchema,
	sort: sortSchema,
});
