import type { z } from "zod";

export type unwrap_t<T extends z.ZodTypeAny> =
	T extends z.ZodOptional<infer U>
		? U extends z.ZodTypeAny
			? unwrap_t<U>
			: T
		: T extends z.ZodNullable<infer U>
			? U extends z.ZodTypeAny
				? unwrap_t<U>
				: T
			: T extends z.ZodCatch<infer U>
				? U extends z.ZodTypeAny
					? unwrap_t<U>
					: T
				: T extends z.ZodPipe<any, infer U>
					? U extends z.ZodTypeAny
						? unwrap_t<U>
						: T
					: T;

export const unwrap = (schema: unknown): z.ZodTypeAny => {
	if (!schema) return schema as z.ZodTypeAny;

	const s = schema as unknown as {
		unwrap?: () => unknown;
		type?: string;
		in?: unknown;
		out?: unknown;
		_def?: { innerType?: unknown };
	};

	if (typeof s.unwrap === "function") {
		return unwrap(s.unwrap());
	}

	if (s._def && s._def.innerType) {
		return unwrap(s._def.innerType);
	}

	if (s.type === "pipe") {
		return unwrap((s.out ?? s.in) as z.ZodTypeAny);
	}

	return schema as z.ZodTypeAny;
};
