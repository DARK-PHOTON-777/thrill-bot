import { z } from "zod";
import { CoasterSchema } from "./coaster.ts";

export const responseSchema = z.object({
	coaster: CoasterSchema,
	response: z.string().min(1),
});
