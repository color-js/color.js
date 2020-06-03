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

// TODO read api/api.json to see what to linkify
// TODO extract into separate file to share between build tools and client-side
showdown.extension("apiLinks", () => [
	{
		type: "lang",
		regex: /`([Cc]olor).(\w+)\(\)`/g,
		replace: ($0, className, funcName) => {
			return `<a href="@@webRoot/api/#Color${className === "Color"? "." : "#"}${funcName}">${$0}</a>`;
		}
	}
]);

showdown.extension("apiLinks", () => [
	{
		type: "lang",
		regex: /^\s*(Tip|Warning|Note)/gm,
		replace: ($0, className, funcName) => {
			return `<p class="${className.toLowerCase()}" markdown="1">`;
		}
	}
]);

// Loosely inspired from https://github.com/xieranmaya/gulp-showdown (unmaintained)
function gulpShowdown(options = {}) {
	let defaultOptions = {
		extensions: ["apiLinks"]
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
</main>

@@include('_footer.html')
</body>
</html>`;
		file.contents = Buffer.from(html);

		callback(null, file);
	});
}

gulp.task("md", function() {
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

gulp.task("default", gulp.parallel("css", "bundle", "html", "md"));
