import { z } from "zod";

export const ParkSchema = z.object({
	id: z.number(),
	name: z.string().trim().min(1),
});

// Fail if stateEnum not represented
export const stateSchema = z.enum([
	"SBNO",
	"Operated",
	"In Storage",
	"Operating",
	"Under Construction",
]);

export const StatusSchema = z.object({
	state: stateSchema,
	date: z.object({
		opened: z.coerce
			.number()
			.int()
			.min(1800)
			.max(2100)
			.optional()
			.catch(undefined),
		closed: z.coerce
			.number()
			.int()
			.min(1800)
			.max(2100)
			.optional()
			.catch(undefined),
	}),
});

export const TypeSchema = z.enum(["Steel", "Wood"]);

export const DesignSchema = z.enum([
	"Suspended",
	"Sit Down",
	"Flying",
	"Inverted",
	"Bobsled",
	"Wing",
	"Stand Up",
	"Pipeline",
]);

export const ElementSchema = z.enum([
	"Chain Lift Hill",
	"Booster Wheel Lift Hill",
	"Cable Lift Hill",
	"Loop",
	"Vertical Chain Lift Hill",
	"Catch Car Lift Hill",
	"Electric Spiral Lift",
	"LSM Launch",
	"LSM Launch (multi-pass)",
	"Elevator Lift",
	"Dark/Show Section",
	"Spiral Lift",
	"Tire Propelled Launch",
	"Splash Track",
	"Flywheel Launch",
	"LIM Launch",
	"Hanging Lift",
	"Ski Lift",
	"Hydraulic Launch",
	"LSM Launch (rolling)",
	"Tunnel",
	"Electric Winch Launch",
	"Compressed Air Launch",
	"Double Corkscrew",
	"Weight Drop Launch",
	"Heartline Roll",
	"Catch Car Vertical Lift",
	"Tire Propelled Launch (multi pass)",
	"LIM Launch (multi-pass)",
	"Sidewinder",
	"Turntable",
	"Cobra Roll",
	"Tire Propelled Launch (rolling)",
	"Roll Over",
	"Helix",
	"In-Line Twist",
	"LSM Lift Hill",
	"Water Channel",
	"Cable Car",
	"Corkscrew",
	"Reverse Sidewinder",
	"Switch Track",
	"Lift Hill",
	"Ferris Wheel Lift",
	"Triple Corkscrew",
	"Tilt Track",
	"Splash Down",
	"Vertical Drop Track",
	"Triple Dip",
	"Block Brake",
	"Stinger Lift",
	"Dive Loop",
	"Zero-G Roll",
]);

export const flattenArray = z.any().transform((val) => {
	if (typeof val === "number") return String(val);
	const target = Array.isArray(val) ? val[0] : val;
	if (typeof target !== "string") return undefined;
	const trimmed = target?.trim();
	return trimmed === "" ? undefined : trimmed;
});

export const flattenNumber = z
	.optional(flattenArray.pipe(z.coerce.number()))
	.catch(undefined);

export const StatsSchema = z.object({
	elements: z.optional(flattenArray.pipe(ElementSchema)).catch(undefined),
	inversions: flattenNumber,
	length: flattenNumber,
	height: flattenNumber,
	speed: flattenNumber,
	//arrangement: z
	//	.string()
	//	.min(1)
	//	.refine((val) => val.toLowerCase() !== "undefined")
	//	.optional()
	//	.catch(undefined),
});

export const PictureSchema = z.object({
	id: z.number(),
	url: z.string().trim().min(1),
});

export const CoasterSchema = z
	.object({
		id: z.number(),

		name: z
			.string()
			.trim()
			.min(1)
			.refine((val) => val.toLowerCase() !== "unknown"), //Fail if name equals "unknown"

		park: ParkSchema,

		city: z.string().trim().min(1),
		state: z.string().trim().min(1),
		//region: z.string().trim().min(1),
		country: z.string().trim().min(1),

		link: z.string().trim().min(1),
		status: StatusSchema,
		type: TypeSchema,
		design: DesignSchema,

		stats: StatsSchema,

		make: z.string().trim().min(1).optional().catch(undefined),
		model: z.string().trim().min(1).optional().catch(undefined),

		picture: PictureSchema.optional().catch(undefined),
	})
	.strip();
