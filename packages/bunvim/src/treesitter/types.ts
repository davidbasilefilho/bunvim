export type Point = {
	row: number;
	column: number;
};

export type TreeSitterNode = {
	type: string;
	startPosition: Point;
	endPosition: Point;
	parent: TreeSitterNode | null;
	children: TreeSitterNode[];
	namedChildren: TreeSitterNode[];
	namedDescendantForPosition: (pos: Point) => TreeSitterNode | null;
	text: string;
};

export type TreeSitterTree = {
	rootNode: TreeSitterNode;
	edit: (edit: TreeSitterEdit) => void;
};

export type TreeSitterEdit = {
	startIndex: number;
	oldEndIndex: number;
	newEndIndex: number;
	startPosition: Point;
	oldEndPosition: Point;
	newEndPosition: Point;
};

export type TreeSitterQuery = {
	captures: (node: any) => Array<{ name: string; node: TreeSitterNode }>;
};

export type TreeSitterParser = {
	setLanguage: (language: any) => void;
	parse: (content: string, oldTree?: any) => TreeSitterTree;
};

export type TreeSitterGrammar = Record<string, unknown>;

export type TreeSitterLanguage = TreeSitterGrammar;

export type TreeSitterModule = Record<string, unknown> & {
	default?: TreeSitterGrammar;
	typescript?: TreeSitterGrammar;
	tsx?: TreeSitterGrammar;
};
