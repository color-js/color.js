import { terser } from "rollup-plugin-terser";

function bundle(format, {minify} = {}) {
	let filename = "color";
	let options = {
		format: format,
		sourcemap: true,
		plugins: []
	};

	if (format === "iife") {
		options.name = "Color";
	}
	else {
		filename += "." + format;

		if (format === "cjs") {
			options.exports = "named"; /** Disable warning for default imports */
		}
	}

	if (minify) {
		filename += ".min";

		options.plugins.push(terser({
			compress: true,
			mangle: true
		}));
	}

	return {
		file: `dist/${filename}.js`,
		...options
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