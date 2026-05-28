import { z } from "zod";
import type { FilterRule } from "./filter.ts";
import type { SortRule } from "./sort.ts";

export type Search = {
	filter: FilterRule;
	sort: SortRule;
};
