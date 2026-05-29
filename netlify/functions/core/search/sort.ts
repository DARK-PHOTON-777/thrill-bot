import type { SortRule } from "../../../../api/types/sort.ts";

const evaluateSort = (rule: SortRule, a: any, b: any): number => {
	if (typeof rule === "string") {
		const valA = typeof a === "number" ? a : 0;
		const valB = typeof b === "number" ? b : 0;
		if (valA === valB) return 0;

		const isAsc = rule === "asc";
		return isAsc ? (valA > valB ? 1 : -1) : valA < valB ? 1 : -1;
	}

	if (typeof rule === "object" && rule !== null) {
		return Object.entries(rule).reduce(
			(sum, [key, subRule]) =>
				sum + evaluateSort(subRule, a?.[key], b?.[key]),
			0,
		);
	}
	return 0;
};

export const applySort = <T extends Record<string, any>>(
	data: T[],
	rules: SortRule,
): T[] => [...data].sort((a, b) => evaluateSort(rules, a, b));
