export type VimOptions = {
	number: boolean;
	relativenumber: boolean;
	leader: string;
	localleader: string;
	nerdFont: boolean;
	tabstop: number;
	shiftwidth: number;
	expandtab: boolean;
	timeoutlen: number;
	scrolloff: number;
	wrap: boolean;
	cursorline: boolean;
	cursorcolumn: boolean;
	hlsearch: boolean;
	incsearch: boolean;
	ignorecase: boolean;
	smartcase: boolean;
	cursorStyle: "block" | "line";
	mouseScrollStep: number;
};

const defaultOptions: VimOptions = {
	number: true,
	relativenumber: false,
	leader: "<Space>",
	localleader: "\\",
	nerdFont: false,
	tabstop: 2,
	shiftwidth: 2,
	expandtab: false,
	timeoutlen: 1000,
	scrolloff: 0,
	wrap: false,
	cursorline: true,
	cursorcolumn: false,
	hlsearch: true,
	incsearch: true,
	ignorecase: false,
	smartcase: true,
	cursorStyle: "block",
	mouseScrollStep: 5,
};

let currentOptions: VimOptions = { ...defaultOptions };

export const getOptions = (): Readonly<VimOptions> => currentOptions;

export const setOption = <K extends keyof VimOptions>(
	key: K,
	value: VimOptions[K],
): void => {
	currentOptions = { ...currentOptions, [key]: value };
};

export const getOption = <K extends keyof VimOptions>(key: K): VimOptions[K] =>
	currentOptions[key];

export const resetOptions = (): void => {
	currentOptions = { ...defaultOptions };
};

const isVimOptionKey = (prop: string): prop is keyof VimOptions =>
	prop in defaultOptions;

export const opt: VimOptions = new Proxy(
	{ ...defaultOptions },
	{
		get(target, prop: string) {
			if (isVimOptionKey(prop)) {
				return currentOptions[prop];
			}
			return undefined;
		},
		set(_target, prop: string, value: unknown) {
			if (isVimOptionKey(prop)) {
				currentOptions = {
					...currentOptions,
					[prop]: value,
				};
				return true;
			}
			return false;
		},
	},
);
