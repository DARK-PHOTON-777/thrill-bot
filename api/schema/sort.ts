import { z } from "zod";
import type { unwrap_t } from "../unwrap.ts";
import { unwrap } from "../unwrap.ts";
import { CoasterSchema } from "./coaster.ts";

export const SortDirectionSchema = z.enum(["asc", "desc"]);

type SortShape = Record<string, z.ZodTypeAny>;

export function createSortSchema(
	schema: z.ZodObject<z.ZodRawShape>,
): z.ZodObject<SortShape> {
	const shape: SortShape = {};

	for (const [key, raw] of Object.entries(schema.shape)) {
		const inner = unwrap(raw);

		if (
			inner instanceof z.ZodString ||
			inner instanceof z.ZodEnum ||
			inner instanceof z.ZodNumber ||
			inner instanceof z.ZodBoolean ||
			inner instanceof z.ZodDate
		) {
			shape[key] = SortDirectionSchema.optional();
		} else if (inner instanceof z.ZodObject) {
			shape[key] = createSortSchema(
				inner as z.ZodObject<z.ZodRawShape>,
			).optional();
		}
	}

	return z.object(shape);
}

export type MapSort<T extends z.ZodRawShape> = {
	[K in keyof T]?: T[K] extends z.ZodTypeAny
		? unwrap_t<T[K]> extends
				| z.ZodString
				| z.ZodEnum<any>
				| z.ZodNumber
				| z.ZodBoolean
				| z.ZodDate
			? "asc" | "desc"
			: unwrap_t<T[K]> extends z.ZodObject<infer S>
				? S extends z.ZodRawShape
					? MapSort<S>
					: never
				: never
		: never;
};

export const sortSchema = createSortSchema(
	CoasterSchema,
) as unknown as z.ZodType<MapSort<typeof CoasterSchema.shape>> & { shape: any };
