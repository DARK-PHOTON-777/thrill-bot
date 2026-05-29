import { assertEquals } from "@std/assert";
import { z } from "zod";
import { filterSchema } from "../api/schema/filter.ts";
import type { Coaster } from "../api/types/coaster.ts";
import { applyFilter } from "../netlify/functions/core/search/filter.ts";
import { applySort } from "../netlify/functions/core/search/sort.ts";

const MOCK_DB = [
	{
		name: "Manta",
		state: "Florida",
		type: "Steel",
		stats: { speed: 56, inversions: 0 },
		status: { state: "Operating" },
	},
	{
		name: "Montu",
		state: "Florida",
		type: "Steel",
		stats: { speed: 65, inversions: 7 },
		status: { state: "Operating" },
	},
	{
		name: "Gwazi",
		state: "Florida",
		type: "Wood",
		stats: { speed: 70, inversions: 0 },
		status: { state: "SBNO" },
	},
] as Coaster[];

Deno.test("createFilterSchema — string becomes string[]", () => {
	const shape = filterSchema.shape;
	assertEquals(shape.state instanceof z.ZodOptional, true);

	const inner = (
		shape.state as z.ZodOptional<z.ZodArray<z.ZodString>>
	).unwrap();
	assertEquals(inner instanceof z.ZodArray, true);
});

Deno.test("createFilterSchema — number becomes { min, max }", () => {
	const statsShape = (
		filterSchema.shape.stats as z.ZodOptional<z.ZodObject<z.ZodRawShape>>
	).unwrap().shape;
	assertEquals(statsShape.speed instanceof z.ZodOptional, true);
});

Deno.test("applyFilter — state string match", () => {
	const filter = filterSchema.parse({ state: ["florida"] });
	const results = applyFilter(MOCK_DB, filter);
	assertEquals(results.length, 3);
});

Deno.test("applyFilter — numeric range", () => {
	const filter = filterSchema.parse({ stats: { speed: { min: 60 } } });
	const results = applyFilter(MOCK_DB, filter);
	assertEquals(
		results.map((c) => c.name),
		["Montu", "Gwazi"],
	);
});

Deno.test("applyFilter — nested status filter", () => {
	const filter = filterSchema.parse({ status: { state: ["operating"] } });
	const results = applyFilter(MOCK_DB, filter);
	assertEquals(
		results.map((c) => c.name),
		["Manta", "Montu"],
	);
});

Deno.test("applyFilter — multiple status filter", () => {
	const filter = filterSchema.parse({
		status: { state: ["operating", "sbno"] },
	});
	const results = applyFilter(MOCK_DB, filter);
	assertEquals(
		results.map((c) => c.name),
		["Manta", "Montu", "Gwazi"],
	);
});

Deno.test("applyFilter — combined filter", () => {
	const filter = filterSchema.parse({
		type: ["Steel"],
		stats: { speed: { min: 60 } },
		status: { state: ["operating"] },
	});
	const results = applyFilter(MOCK_DB, filter);
	assertEquals(
		results.map((c) => c.name),
		["Montu"],
	);
});

Deno.test("applySort — stats speed asc", () => {
	const results = applySort(MOCK_DB, {
		stats: { speed: "asc" },
	});
	assertEquals(
		results.map((c) => c.name),
		["Manta", "Montu", "Gwazi"],
	);
});

Deno.test("applySort — stats speed desc", () => {
	const results = applySort(MOCK_DB, {
		stats: { speed: "desc" },
	});
	assertEquals(
		results.map((c) => c.name),
		["Gwazi", "Montu", "Manta"],
	);
});
