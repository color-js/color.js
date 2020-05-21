const gulp = require("gulp");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const rollup = require("rollup");
const { terser: terser } = require("rollup-plugin-terser");
const fileinclude = require("gulp-file-include");
const Showdown = require("showdown");

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

// https://metafizzy.co/blog/transfob-replaces-through2-gulp/
const Transform = require("stream").Transform;

function transfob( _transform ) {
	var transform = new Transform({
		objectMode: true
	});
	transform._transform = _transform;
	return transform;
};

// Loosely inspired from https://github.com/xieranmaya/gulp-showdown (unmaintained)
function gulpShowdown(options = {}) {
	let defaultOptions = {
		headerLevelStart: 2
	};

	let converter = new Showdown.Converter(Object.assign({}, defaultOptions, options));
	converter.setFlavor("github");
	converter.setOption("simpleLineBreaks", false);

	return transfob(function (file, encoding, callback) {
		let text = file.contents.toString();
		let title = (text.match(/^#\s+(.+)$/m) || [, ""])[1];
		let html = converter.makeHtml(text);

		html = `<!DOCTYPE html>
<html>
<head>
<title>${title} &bull; Color.js</title>
@@include('_head.html')
</head>
<body>
@@include('_header.html')
<main>
${html}
</main>
@@include('_footer.html')
</body>
</html>`;
		file.contents = Buffer.from(html);

		callback(null, file);
	});
}

gulp.task("md", function() {
	return gulp.src(["**/*.md", "!node_modules/**", "!README.md", "!CONTRIBUTING.md"])
	.pipe(gulpShowdown())
	.pipe(fileinclude({
		basepath: "templates/"
	}).on("error", function(error) {
		console.error(error);
	}))
	.pipe(rename({ extname: ".html" }))
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
	// gulp.watch(["**/*.tpl.html", "**/*.md", "./templates/*.html"], ["html"]);
	gulp.watch(["**/*.md", "./templates/*.html"], gulp.series("md"));
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
