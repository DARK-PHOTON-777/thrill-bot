import { callModel, tool } from "@openrouter/agent";
import { OpenRouter } from "@openrouter/sdk";
import { searchSchema } from "../../../api/schema/search";
import type { Coaster } from "../../../api/types/coaster.ts";
import type { Response } from "../../../api/types/response.ts";
import type { Search } from "../../../api/types/search";
import data from "../../../data/coasters.json";
import { logger } from "./logger.ts";
import { search } from "./search/search.ts";

const coasters: Coaster[] = data as Coaster[];

const coasterSearchTool = tool({
	name: "search_rollercoasters",
	description: `Search rollercoasters by attribute. Returns up to 3 results in metric.

CONCEPT → FIELD MAPPING:
- Location (state known)  → state: ["Ohio"]  (never add country)
- Location (country only) → country: ["United States", "America", "United States of America"]
- Launch coaster          → stats.elements: ["LSM Launch","LIM Launch","Hydraulic Launch","Flywheel Launch","Compressed Air Launch","Tire Propelled Launch"]
- Wooden coaster          → type: ["Wood"]
- Inverted/flying/wing    → design: ["Inverted"/"Flying"/"Wing"]
- Fastest/tallest/longest → sort only, NO stat constraints
- Family/kids             → stats.speed.max: 80

SORT SHORTHANDS:
oldest=status.opened:asc | newest=status.opened:desc | fastest=stats.speed:desc | tallest=stats.height:desc | longest=stats.length:desc

ALWAYS SET: status.state: ["Operating"] unless asked otherwise.
NEVER SET: make/model unless user names a manufacturer. Never invent enum values.
USE MINIMUM FIELDS. Each extra field risks zero results.`,
	inputSchema: searchSchema,
	execute: async (searchRule) => {
		logger.debug(searchRule, "LLM Search Rule");

		if (
			searchRule.filter?.stats?.speed?.max &&
			searchRule.filter.stats.speed.max >= 500
		) {
			delete searchRule.filter.stats.speed.max;
		}
		if (searchRule.filter.stats?.speed?.min === 0) {
			delete searchRule.filter.stats.speed.min;
		}

		if (searchRule.filter.state && searchRule.filter.country) {
			delete searchRule.filter.country;
		}

		const results = search(coasters, searchRule as Search);

		logger.debug(results.length, "Coaster Matches");

		if (results.length === 0) {
			return { found: 0, results: [] };
		}

		return {
			found: results.length,
			results: results.slice(0, 3),
		};
	},
});

const SYSTEM_PROMPT = `You are ThrillBot, a roller coaster recommendation expert.

## TOOL RULES
- Call search_rollercoasters at most 3 times.
- On the first call, use the MINIMUM fields needed. Only add fields that directly answer the query.
- If results > 10, call again changing ONLY ONE field to narrow down.
- Never search by ID.

## FIELD SELECTION RULES
**Location:** Use ONLY the most specific field available.
  - If city is known → use only city
  - If state is known → use only state (NOT country too — state implies country)
  - If only country → use only country
  
**"Launch coaster"** → search elements: ["LSM Launch", "LIM Launch", "Hydraulic Launch", "Tire Propelled Launch", "Flywheel Launch", "Compressed Air Launch"]
**"Wooden coaster"** → type: ["Wood"]
**"Inverted/flying/wing"** → design: ["Inverted"] / ["Flying"] / ["Wing"]

**Stats (speed/height/length):** 
  - Only set min/max if the user explicitly gives a number or implies a bound ("under 100mph", "family-friendly")
  - "fastest" = sort by speed desc, NO max constraint
  - "tallest" = sort by height desc, NO max constraint

**make/model:** NEVER include unless the user names a specific manufacturer or model.

**NEVER invent values.** Only use exact strings from the schema enums.
  - type is ONLY: "Steel" or "Wood"
  - design is ONLY: "Sit Down", "Inverted", "Flying", "Wing", "Stand Up", "Suspended", "Bobsled", "Pipeline"

## BAD EXAMPLES (never do this)
❌ type: ["Roller Coaster"]          — not a valid enum
❌ design: ["Traditional"]           — not a valid enum  
❌ stats.speed.max: 999              — meaningless constraint
❌ make: ["Intamin", "Vekoma", ...]     — hallucinated unless user asked
❌ state: ["Ohio"], country: ["United States"] — redundant
❌ model: ["LSM"]                    — use elements instead

## GOOD EXAMPLES
Query: "fast coaster in Ohio"
→ filter: { state: ["Ohio"], status: { state: ["Operating"] } }
→ sort: { stats: { speed: "desc" } }

Query: "launch coaster in Pennsylvania"  
→ filter: { state: ["Pennsylvania"], status: { state: ["Operating"] }, stats: { elements: ["LSM Launch", "LIM Launch", "Hydraulic Launch", "Tire Propelled Launch"] } }
→ sort: { name: "asc" }

## RESPONSE FORMAT
After selecting, reply with a high-energy one-liner. Include park name and CONVERT KEY METRIC STAT TO IMPERIAL.
End your final response with exactly: SELECTED_ID: <id>`;

export async function getCoaster(query: string): Promise<Response> {
	const client = new OpenRouter({
		apiKey: process.env.OPENROUTER_API_KEY as string,
	});

	logger.debug({ query }, "LLM Query");

	const result = callModel(client, {
		model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-3-haiku",
		tools: [coasterSearchTool] as const,
		temperature: 0,
		input: [
			{ role: "system", content: SYSTEM_PROMPT, id: "system-prompt" },
			{ role: "user", content: query },
		],
	});

	const responseText = await result.getText();

	logger.debug({ responseText }, "LLM Raw Response");

	const id = responseText.match(/SELECTED_ID:\s*(\d+)/);

	const coasterId = id ? parseInt(id[1], 10) : null;

	const match =
		typeof coasterId === "number"
			? coasters.find((c) => c.id === coasterId)
			: undefined;

	if (!match)
		return {
			coaster: coasters[Math.floor(Math.random() * coasters.length)],
			response:
				"Sorry, I couldn't think of a Rollercoaster. Here is a random suggestion.",
		};

	const response = responseText
		.replace(/SELECTED_ID:\s*\d+/, "")
		.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
		.replace(/<\/?response>/g, "")
		.replace(/\n/g, "")
		.replace('"', "")
		.trim();

	return {
		coaster: match,
		response: response,
	};
}
