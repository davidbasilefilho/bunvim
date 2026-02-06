export type Mark = {
	path: string;
	line: number;
	column: number;
};

const projectMarks: Map<string, Mark[]> = new Map();

export function addMark(projectRoot: string, mark: Mark) {
	const marks = projectMarks.get(projectRoot) ?? [];
	if (!marks.some((m) => m.path === mark.path)) {
		projectMarks.set(projectRoot, [...marks, mark]);
	}
}

export function getMarks(projectRoot: string): Mark[] {
	return projectMarks.get(projectRoot) ?? [];
}

export function removeMark(projectRoot: string, path: string) {
	const marks = projectMarks.get(projectRoot) ?? [];
	projectMarks.set(
		projectRoot,
		marks.filter((m) => m.path !== path),
	);
}

export function clearMarks(projectRoot: string) {
	projectMarks.delete(projectRoot);
}
