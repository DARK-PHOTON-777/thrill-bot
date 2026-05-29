import type { z } from "zod";
import type { SortDirectionSchema } from "../schema/sort.ts";

export type SortDirection = z.infer<typeof SortDirectionSchema>;

export type SortRule = SortDirection | { [key: string]: SortRule };
