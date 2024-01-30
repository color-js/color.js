import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as spaces from "../src/spaces/index-fn.js";

const coords = new Set();
for (let space in spaces) {
	for (let id in spaces[space].coords) {
		coords.add(id);
	}
}

let template = "declare class CoordAccessors {";
for (const coord of Array.from(coords).sort()) {
	template += `\n\t${coord}: number;`;
}
template += `
}
export default CoordAccessors;
`;

try {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const filePath = path.resolve(__dirname, "../types/src/coord-accessors.d.ts");
	fs.writeFileSync(filePath, template);
}
catch (err) {
	console.error(err);
}
