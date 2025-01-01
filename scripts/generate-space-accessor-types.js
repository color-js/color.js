import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import * as spaces from "../src/spaces/index-fn.js";

const coords = new Set();
const spaceIds = new Set();
for (const spaceModule in spaces) {
	const space = spaces[spaceModule];
	spaceIds.add(space.id.replace(/-/g, "_"));
	for (const alias of space.aliases || []) {
		spaceIds.add(alias.replace(/-/g, "_"));
	}
	for (const coord in space.coords) {
		coords.add(coord);
	}
}

let template = `// DO NOT EDIT. This file is generated with \`npm run build:space-accessors\`.

/** Proxy used for space accessors */
export type SpaceAccessor = Record<string, number> & number[];

declare class SpaceAccessors {`;
for (const spaceId of Array.from(spaceIds).sort()) {
	template += `\n\t${spaceId}: SpaceAccessor;`;
}
for (const coord of Array.from(coords).sort()) {
	template += `\n\t${coord}: number;`;
}
template += `
}

export default SpaceAccessors;
`;

try {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const filePath = path.resolve(__dirname, "../src/space-coord-accessors.d.ts");
	fs.writeFileSync(filePath, template);
} catch (err) {
	console.error(err);
}
