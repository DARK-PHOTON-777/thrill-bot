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
	description: `Find coasters by attribute. 
    Convert imperial inputs (mph/ft) to metric (km/h, m) before calling. 
    Use up to 3 TIMES ONLY. Do not use for ID selection.
	Always use the status.state:"Operating" unless asked specifically for a different state.
	THE TOOL ONLY DISPLAYS 3 RESULTS AT A TIME. IT WILL NOT SHOW YOU ALL THE RESULTS.
	DON'T ASSUME YOU FOUND THE CORRECT COASTER. YOU MUST USE THE SORT FUNCTION TO GET ALL THE CORRECT RESULT.
    AVOID defining fields unless necessary to narrow down results. 
    if user asks for something like oldest, newest, fastest, slowest, etc.. use the relevant sort field.
    Text searches are subtext matches. You MUST provide multiple variations in the string arrays to ensure a loose filter.
	DO NOT USE ABBREVIATIONS("US", "OH") when creating filter.
    For locations like the US, always include all variations: ["United States", "America", "United States of America"].
	DO NOT OVERCONSTRAIN FILTERS. For instance, it's guarenteed that OHIO will be in the UNITED STATES.
	Avoid using make / model for searching: Make will be specific manufactures.
	If user request specialy types like launched, look for it in the elements enum. Use as many enumerations as possible that fit the description (LSM, LSM Launch, LIM).
	Do not put max / min constraints on stats unless the users ask for it or is implied like (family -> speed: <100). DO NOT IF THEY ARE ASKING FOR FASTEST / LONGEST / etc..
	DO NOT ADD PARKS UNLESS ASKED TO.
	oldest = status.opened:asc, "newest = status.opened:desc", "tallest = stats.height:desc", "longest = stats.length:desc", "fastest = stats.speed:desc", "slowest = stats.speed:asc"
	`,
	inputSchema: searchSchema,
	execute: async (searchRule) => {
		logger.debug(searchRule, "LLM Search Rule");

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

const SYSTEM_PROMPT = `You are ThrillBot, a high-energy roller coaster expert.
When asked for a recommendation, follow these rules exactly:
1. Call search_rollercoasters ONCE to discover options.
2. If results are greater than 10, filter them down only ONE more time(Change only ONE field!). Ignore this step if filtering for fastests, longest, newer, oldest..
3. Select the SINGLE best metric match from the tool results.
4. Reply with a high-energy quip answering the user. Include the park name and a key stat(Must convert to imperial units).
5. Append exactly "SELECTED_ID: <id_number>" to the very last line of your response.

Example:
"You've got to try VelociCoaster at Universal Islands of Adventure! It launches you at 112 km/h through a zero-g stall.
SELECTED_ID: 104"`;

export async function getCoaster(query: string): Promise<Response> {
	const client = new OpenRouter({
		apiKey: process.env.OPENROUTER_API_KEY as string,
	});

	logger.debug({ query }, "LLM Query");

	const result = callModel(client, {
		model: process.env.OPENROUTER_MODEL ?? "anthropic/claude-3-haiku",
		tools: [coasterSearchTool] as const,
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
