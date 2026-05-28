import type { FilterRule } from "../../../../api/types/filter.ts";

export const evaluateFilter = <T extends Record<string, any>>(
	data: T,
	rules: FilterRule,
): boolean => {
	return Object.entries(rules).every(([key, rule]) => {
		if (rule == null) return true;
		const val = data?.[key];

		if (Array.isArray(rule)) {
			return (
				typeof val === "string" &&
				rule.some((s) => val.toLowerCase().includes(s.toLowerCase()))
			);
		}

		if (typeof rule === "object" && ("min" in rule || "max" in rule)) {
			if (typeof val !== "number") return false;
			return (
				(rule.min === undefined || val >= rule.min) &&
				(rule.max === undefined || val <= rule.max)
			);
		}

		if (
			typeof rule === "object" &&
			typeof val === "object" &&
			val !== null
		) {
			return evaluateFilter(val, rule);
		}

		return false;
	});
};

export const applyFilter = <T extends Record<string, any>>(
	data: T[],
	rules: FilterRule,
): T[] => {
	return data.filter((item) => evaluateFilter(item, rules));
};
