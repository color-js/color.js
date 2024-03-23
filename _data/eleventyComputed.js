export default {
	// Extract default title from content
	title (data) {
		if (data.title) {
			return data.title;
		}

		let ext = data.page.inputPath.split(".").pop();

		// Title must appear in first 1000 chars
		let content = data.page.rawInput.slice(0, 1000);

		if (ext === "md") {
			// First heading
			return content.match(/^#+\s+(.*)/m)?.[1];
		}
		else if (ext === "njk") {
			// First level 1 heading
			return content.match(/<h1>(.*)<\/h1>/)?.[1]?.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
		}
	},
};
