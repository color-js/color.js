import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

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

let legacyPlugins = [
	commonjs(),
	nodeResolve(),
	babel({ babelHelpers: "bundled", exclude: "node_modules/**" }),
];

// Add legacy versions of every bundle
bundles = bundles.flatMap(bundle => {
	let legacyBundle = Object.assign({}, bundle);
	legacyBundle.file = legacyBundle.file.replace(/\.\w+$/, ".legacy$&");
	legacyBundle.plugins ||= [];
	legacyBundle.plugins.push(legacyPlugins);

	return [bundle, legacyBundle];
});

// Add minified versions of every bundle
bundles = bundles.flatMap(bundle => {
	let minBundle = Object.assign({}, bundle);
	minBundle.file = minBundle.file.replace(/\.\w+$/, ".min$&");
	minBundle.plugins ||= [];
	minBundle.plugins.push(terser({
		compress: true,
		mangle: true
	}));

	return [bundle, minBundle];
});

export default {
	input: "src/index.js",
	output: bundles,
	onwarn (warning, rollupWarn) {
		if (warning.code !== 'CIRCULAR_DEPENDENCY') {
			rollupWarn(warning);
		}
	}
};
