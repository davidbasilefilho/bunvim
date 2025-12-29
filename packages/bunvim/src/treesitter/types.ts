export type TreeSitterGrammar = unknown;
export type TreeSitterModule = Record<string, unknown>;
export type TreeSitterLanguage = unknown;
export type TreeSitterTree = unknown;
export type TreeSitterParser = {
	setLanguage: (language: TreeSitterLanguage) => void;
	parse: (content: string) => TreeSitterTree;
};
