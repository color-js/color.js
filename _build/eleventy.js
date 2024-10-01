import { createRequire } from "module";
const require = createRequire(import.meta.url);
import * as filters from "./filters.js";

export default config => {
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
		excerpt_separator: "<!-- more -->",
	});

	for (let f in filters) {
		config.addFilter(f, filters[f]);
	}

	return {
		markdownTemplateEngine: "njk",
		templateFormats: ["md", "njk"],
		dir: {
			data: "data",
			output: ".",
		},
	};
};
