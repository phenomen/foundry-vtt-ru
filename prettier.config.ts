import type { Config } from "prettier";

const config: Config = {
	useTabs: true,
	tabWidth: 2,
	endOfLine: "lf",
	printWidth: 100,
	bracketSameLine: false,
	bracketSpacing: true,

	semi: true,
	singleQuote: false,
	jsxSingleQuote: false,
	quoteProps: "preserve",
	trailingComma: "es5",
	arrowParens: "always",

	htmlWhitespaceSensitivity: "css",
};

export default config;
