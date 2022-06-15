import { terser } from "rollup-plugin-terser";

function bundle(format, {minify} = {}) {
	let filename = "color";

	if (format !== "iife") {
		filename += "." + format;
	}

	if (minify) {
		filename += ".min";
	}

	return {
		file: `dist/${filename}.js`,
		name: "Color",
		format: format,
		sourcemap: true,
		exports: "named", /** Disable warning for default imports */
		plugins: [
			minify? terser({
				compress: true,
				mangle: true
			}) : undefined
		]
	};
}

export default {
	input: "src/main.js",
	output: [
		bundle("iife"),
		bundle("iife", {minify: true}),
		bundle("esm"),
		bundle("esm", {minify: true}),
		bundle("cjs"),
		bundle("cjs", {minify: true})
	],
	onwarn (warning, rollupWarn) {
		if (warning.code !== 'CIRCULAR_DEPENDENCY') {
			rollupWarn(warning);
		}
	}
};