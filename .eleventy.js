let markdownIt = require("markdown-it");

module.exports = config => {
	let data = {
		"layout": "page.njk",
		"permalink": "{{ page.filePathStem }}.html",
	};

	for (let p in data) {
		config.addGlobalData(p, data[p]);
	}

	config.setDataDeepMerge(true);

	config.setFrontMatterParsingOptions({
		excerpt: true,
		// Optional, default is "---"
		excerpt_separator: "<!-- more -->"
	});

	config.setLibrary("md", markdownIt({
			html: true,
		})
		.disable("code")
	);

	// config.addFilter("readable_date", date => {
	// 	return new Date(date).toLocaleString("en-US", {
	// 		dateStyle: "full",
	// 		timeStyle: "short"
	// 	});
	// });

	config.addFilter(
		"relative",
		page => {
			let path = page.url.replace(/[^/]+$/, "");
			let ret = require("path").relative(path, "/");

			return ret || ".";
		}
	);

	config.addFilter(
		"unslugify",
		slug => slug.replace(/(^|-)([a-z])/g, ($0, $1, $2) => ($1? " " : "") + $2.toUpperCase())
	);

	config.addFilter(
		"first_heading",
		content => {
			// console.log(content);
			return content? content.match(/^#+\s*(.+)/)?.[1] ?? "NO_HEADING_FOUND" : "EMPTY_CONTENT";
		}
	);

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			output: "."
		}
	};
};
