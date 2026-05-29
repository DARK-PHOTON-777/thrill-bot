import type { z } from "zod";
import type { responseSchema } from "../schema/response.ts";

export type Response = z.infer<typeof responseSchema>;
