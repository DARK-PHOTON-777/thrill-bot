import type { Search } from "../../../../api/types/search.ts";
import { applyFilter } from "./filter.ts";
import { applySort } from "./sort.ts";

export const search = <T extends Record<string, any>>(
	data: T[],
	search: Search,
): T[] => {
	return applySort(applyFilter(data, search.filter), search.sort);
};
