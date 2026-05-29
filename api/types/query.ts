import type { z } from "zod";
import type { QuerySchema } from "../schema/query.ts";

export type Query = z.infer<typeof QuerySchema>;
