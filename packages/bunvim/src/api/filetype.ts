export type FiletypeConfig = {
	tabstop?: number;
	shiftwidth?: number;
	expandtab?: boolean;
	commentstring?: string;
	formatoptions?: string;
	lsp?: {
		server: string;
		settings?: Record<string, any>;
		root_patterns?: string[];
	};
	treesitter?: {
		highlight?: boolean;
		indent?: boolean;
	};
	formatter?: {
		command: string;
		args?: string[];
	};
};

const filetypes: Record<string, FiletypeConfig> = {};

export function setup(filetype: string | string[], config: FiletypeConfig) {
	const fts = Array.isArray(filetype) ? filetype : [filetype];
	for (const ft of fts) {
		filetypes[ft] = { ...filetypes[ft], ...config };
	}
}

export function get(filetype: string): FiletypeConfig | undefined {
	return filetypes[filetype];
}
