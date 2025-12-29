import type { Position } from "../utils/position";
import { generateLabels } from "./labels";

export type FlashTarget = {
	position: Position;
	label: string;
};

export function computeTargets(
	visibleLines: string[],
	scrollTop: number,
	query: string,
): FlashTarget[] {
	const targets: FlashTarget[] = [];
	if (!query) return targets;

	const lowerQuery = query.toLowerCase();

	visibleLines.forEach((line, i) => {
		const lowerLine = line.toLowerCase();
		let index = lowerLine.indexOf(lowerQuery);
		while (index !== -1) {
			targets.push({
				position: { line: scrollTop + i, column: index },
				label: "",
			});
			index = lowerLine.indexOf(lowerQuery, index + 1);
		}
	});

	const labels = generateLabels(targets.length);
	targets.forEach((target, i) => {
		target.label = labels[i] || "";
	});

	return targets;
}

export function findTargetByLabel(
	targets: FlashTarget[],
	label: string,
): FlashTarget | undefined {
	return targets.find((t) => t.label === label);
}
