import { z } from "zod";
import type { unwrap_t } from "../unwrap.ts";
import { unwrap } from "../unwrap.ts";
import { CoasterSchema } from "./coaster.ts";

type FilterShape = Record<string, z.ZodTypeAny>;

export function createFilterSchema(
	schema: z.ZodObject<z.ZodRawShape>,
): z.ZodObject<FilterShape> {
	const shape: FilterShape = {};

	for (const [key, raw] of Object.entries(schema.shape)) {
		const inner = unwrap(raw);

		if (inner instanceof z.ZodEnum) {
			shape[key] = z.array(inner).optional();
		} else if (inner instanceof z.ZodString) {
			shape[key] = z.array(z.string()).optional();
		} else if (inner instanceof z.ZodNumber) {
			shape[key] = z
				.object({
					min: z.number().optional(),
					max: z.number().optional(),
				})
				.optional();
		} else if (inner instanceof z.ZodObject) {
			shape[key] = createFilterSchema(
				inner as z.ZodObject<z.ZodRawShape>,
			).optional();
		}
	}

	return z.object(shape);
}

export type MapFilter<T extends z.ZodRawShape> = {
	[K in keyof T]?: T[K] extends z.ZodTypeAny
		? unwrap_t<T[K]> extends z.ZodString | z.ZodEnum<any>
			? string[]
			: unwrap_t<T[K]> extends z.ZodNumber
				? { min?: number; max?: number }
				: unwrap_t<T[K]> extends z.ZodObject<infer S>
					? S extends z.ZodRawShape
						? MapFilter<S>
						: never
					: never
		: never;
};

export const filterSchema = createFilterSchema(
	CoasterSchema.pick({
		park: true,

		city: true,
		state: true,
		country: true,
		type: true,
		design: true,

		status: true,
		stats: true,

		make: true,
		model: true,
	}),
) as unknown as z.ZodType<MapFilter<typeof CoasterSchema.shape>> & {
	shape: any;
};
