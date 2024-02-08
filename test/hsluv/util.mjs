import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function readTestData () {
	try {
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const filePath = path.resolve(__dirname, "snapshot-rev4.json");
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	}
	catch (err) {
		console.error(err);
	}
}

// Color parsing does not handle values with exponents
// The values with exponents are extremely small so we can just set them to 0
export function normalizeCoords (coords) {
	return coords.map(value => {
		return value < 0.00000001 ? 0 : value;
	});
}
