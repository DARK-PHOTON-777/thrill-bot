import { CoasterSchema } from "../api/schema/coaster.ts";
import type { Coaster } from "../api/types/coaster.ts";
import type { Dataset, DatasetElement } from "../api/types/dataset.ts";

const raw = await Deno.readTextFile(
	new URL("../data/coasters-raw.json", import.meta.url),
);
const coasters: Dataset = JSON.parse(raw);

interface ErrorSummaryRecord {
	field: string;
	reason: string;
	count: number;
	sampleIndices: number[];
}

function debugRollerCoasterData(rawItems: DatasetElement[]) {
	const successfulRecords: Coaster[] = [];

	const errorAggregator = new Map<string, ErrorSummaryRecord>();

	rawItems.forEach((item, index) => {
		const result = CoasterSchema.safeParse({
			...item,
			picture: item.mainPicture || item.pictures[0],
		});

		if (result.success) {
			successfulRecords.push(result.data);
		} else {
			result.error.issues.forEach((issue) => {
				const fieldName = issue.path.join(".") || "(root)";
				const errorReason = `${issue.code}: ${issue.message}`;

				const uniqueKey = `${fieldName}|${errorReason}`;

				const existing = errorAggregator.get(uniqueKey);

				if (existing) {
					existing.count += 1;
					if (existing.sampleIndices.length < 5) {
						existing.sampleIndices.push(index);
					}
				} else {
					errorAggregator.set(uniqueKey, {
						field: fieldName,
						reason: errorReason,
						count: 1,
						sampleIndices: [index],
					});
				}
			});
		}
	});

	const sortedFailures = Array.from(errorAggregator.values()).sort(
		(a, b) => b.count - a.count,
	);

	return {
		successCount: successfulRecords.length,
		validData: successfulRecords,
		sortedErrorSummary: sortedFailures,
	};
}

const test = debugRollerCoasterData(coasters);

console.log(`Survived: ${test.validData.length}`);

console.log(`Top 20 Errors`);

test.sortedErrorSummary.slice(0, 20).forEach((err) => {
	console.log(`${err.field} ${err.reason}: ${err.count}`);
});

await Deno.writeTextFile(
	new URL("../data/coasters.json", import.meta.url),
	JSON.stringify(test.validData, null, "\t"),
);
