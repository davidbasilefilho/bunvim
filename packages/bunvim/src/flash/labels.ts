const LABEL_CHARS = "asdfghjklqwertyuiopzxcvbnm";

export function generateLabels(count: number): string[] {
	const labels: string[] = [];

	for (let i = 0; i < Math.min(count, LABEL_CHARS.length); i++) {
		labels.push(LABEL_CHARS[i]!);
	}

	if (count > LABEL_CHARS.length) {
		for (let i = 0; i < LABEL_CHARS.length && labels.length < count; i++) {
			for (let j = 0; j < LABEL_CHARS.length && labels.length < count; j++) {
				labels.push(LABEL_CHARS[i]! + LABEL_CHARS[j]!);
			}
		}
	}

	return labels;
}
