import type { z } from "zod";
import type { CoasterSchema } from "../schema/coaster.ts";

export type Coaster = z.infer<typeof CoasterSchema>;
