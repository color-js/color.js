const bundles = [
	{
		file: "dist/color.global.js",
		format: "iife",
		sourcemap: true,
		name: "Color",
	},
	{
		file: "dist/color.cjs",
		format: "cjs",
		sourcemap: true,
		exports: "named",
	},
];

const fnBundles = [
	{
		file: "dist/color-fn.cjs",
		format: "cjs",
		sourcemap: true,
		exports: "named",
	},
];

export default [
	{
		input: "src/index.js",
		output: bundles,
		onwarn (warning, rollupWarn) {
			if (warning.code !== "CIRCULAR_DEPENDENCY") {
				rollupWarn(warning);
			}
		},
	},
	{
		input: "src/index-fn.js",
		output: fnBundles,
		onwarn (warning, rollupWarn) {
			if (warning.code !== "CIRCULAR_DEPENDENCY") {
				rollupWarn(warning);
			}
		},
	},
];
