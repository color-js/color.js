import terser from "@rollup/plugin-terser";

let bundles = [
	{
		"file": "dist/color.global.js",
		"format": "iife",
		"sourcemap": true,
		"name": "Color"
	},
	{
		"file": "dist/color.js",
		"format": "esm",
		"sourcemap": true,
	},
	{
		"file": "dist/color.cjs",
		"format": "cjs",
		"sourcemap": true,
		"exports": "named",
	},
];

let fnBundles = [
	{
		"file": "dist/color-fn.cjs",
		"format": "cjs",
		"sourcemap": true,
		"exports": "named",
	},
];

// Add minified versions of every bundle
let addMinBundle = (bundles) => {
	return bundles.flatMap(bundle => {
		let minBundle = Object.assign({}, bundle);
		minBundle.file = minBundle.file.replace(/\.\w+$/, ".min$&");
		minBundle.plugins ||= [];
		minBundle.plugins.push(terser());

		return [bundle, minBundle];
	})
}

export default [
	{
		input: "src/index.js",
		output: addMinBundle(bundles),
		onwarn (warning, rollupWarn) {
			if (warning.code !== "CIRCULAR_DEPENDENCY") {
				rollupWarn(warning);
			}
		}
	},
	{
		input: "src/index-fn.js",
		output: addMinBundle(fnBundles),
		onwarn (warning, rollupWarn) {
			if (warning.code !== "CIRCULAR_DEPENDENCY") {
				rollupWarn(warning);
			}
		}
	},
]
