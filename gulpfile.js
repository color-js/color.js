const gulp = require("gulp");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const rollup = require("rollup");
const { terser: terser } = require("rollup-plugin-terser");
const fileinclude = require("gulp-file-include");
const showdown = require("showdown");

const globs = {
	css: ["**/*.src.css", "!node_modules/**"],
	md: ["**/*.md", "!node_modules/**", "!README.md", "!CONTRIBUTING.md"],
	html: ["**/*.tpl.html"]
};

gulp.task("css", function () {
	return gulp.src(globs.css)
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
		extensions: ["apiLinks", "callouts"]
		// headerLevelStart: 2
	};

	let converter = new showdown.Converter(Object.assign({}, defaultOptions, options));
	converter.setFlavor("github");
	converter.setOption("simpleLineBreaks", false);

	return transfob(function (file, encoding, callback) {
		let text = file.contents.toString();

		// Move first h1 inside header
		let title;
		text = text.replace(/^#\s+(.+)$/m, (_, $1) => {
			title = $1;
			return "";
		});

		let html = converter.makeHtml(text);
		let isDocs = file.path.indexOf("/docs/") > -1;

		let relativePath = file.path.replace(__dirname, "");

		html = `<!DOCTYPE html>
<html>
<head>
<title>${title} &bull; Color.js</title>
@@include('_head.html')
${isDocs? '<link rel="stylesheet" href="@@webRoot/assets/css/docs.css" />' : ""}
</head>
<body class="language-js">
@@include('_header.html', {
	"title": "${title}"
})
<main>
${isDocs? `<aside id="toc">
<ul>
@@include('_docs-nav.html')
</ul>
</aside>` : ""}
${html}

<footer>
	<a href="@@webRoot/notebook/index.html?storage=https://github.com/leaverou/color.js${relativePath}" class="edit-page" target="_blank">
		Edit this page on Color Notebook
	</a>
</footer>
</main>

@@include('_footer.html')
</body>
</html>`;
		file.contents = Buffer.from(html);

		callback(null, file);
	});
}

gulp.task("md", async function() {
	const {default: extensions} = await import("./assets/js/showdown-extensions.mjs");

	for (let id in extensions) {
		showdown.extension(id, () => [
			extensions[id]
		]);
	}

	return gulp.src(globs.md)
	.pipe(gulpShowdown())
	.pipe(fileinclude({
		basepath: "templates/"
	}).on("error", function(error) {
		console.error(error);
	}))
	.pipe(rename({ extname: ".html" }))
	.pipe(gulp.dest("."));
});

gulp.task("html", function() {
	return gulp.src(globs.html)
		.pipe(fileinclude({
			basepath: "templates/"
		}).on("error", function(error) {
			console.error(error);
		}))
		.pipe(rename({ extname: "" }))
		.pipe(rename({ extname: ".html" }))
		.pipe(gulp.dest("."));
});

gulp.task("watch", function() {
	gulp.watch(globs.css, gulp.series("css"));
	gulp.watch(["./templates/*.html", ...globs.html], gulp.series("html"));
	gulp.watch(["./templates/*.html", ...globs.md], gulp.series("md"));
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

gulp.task("bundle", async function () {
	for (const bundle of rollupConfig.output) {
		let b = await rollup.rollup({
			input: rollupConfig.input,
			plugins: bundle.plugins,
			onwarn: rollupConfig.onwarn
		});

		await b.write(bundle);
	}
});

gulp.task("default", gulp.parallel("css", "bundle", "html", "md"));
