const gulp = require("gulp");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const rollup = require("rollup");
const { terser: terser } = require("rollup-plugin-terser");
// const fileinclude = require("gulp-file-include");

gulp.task("css", function () {
	return gulp.src(["**/*.src.css", "!node_modules/**"])
		.pipe(postcss([
			require("postcss-nesting")(),
			// require("postcss-selector-matches")({
			// 	lineBreak: true
			// }),
			// require("autoprefixer")({
			// 	browsers: ["last 2 versions"]
			// })
		]))
		.pipe(rename({ extname: "" }))
		.pipe(rename({ extname: ".css" }))
		.pipe(gulp.dest("."));
});

// gulp.task("html", function() {
// 	return gulp.src(["**/*.tpl.html"])
// 		.pipe(fileinclude({
// 			basepath: "templates/"
// 		}).on("error", function(error) {
// 			console.error(error);
// 		}))
// 		.pipe(rename({ extname: "" }))
// 		.pipe(rename({ extname: ".html" }))
// 		.pipe(gulp.dest("."));
// });

gulp.task("watch", function() {
	gulp.watch(["**/*.src.css"], gulp.series("css"));
	// gulp.watch(["**/*.tpl.html", "./templates/*.html"], ["html"]);
});

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

// Same as a rollup.config.js
let rollupConfig = {
	input: "src/main.js",
	output: [
		bundle("iife"),
		bundle("iife", {minify: true}),
		bundle("esm"),
		bundle("esm", {minify: true})
	],
};

gulp.task("bundle", async function () {
	for (const bundle of rollupConfig.output) {
		let b = await rollup.rollup({
			input: rollupConfig.input,
			plugins: bundle.plugins
		});

		await b.write(bundle);
	}
});

gulp.task("default", gulp.parallel("css", "bundle"));
