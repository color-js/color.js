import ColorSpace from "../src/spaces/index.js";
import {WHITES} from "../src/adapt.js";

let whitePoints = Object.entries(WHITES);

// 11ty chokes on this
// import modules from "./modules.json" with { type: "json" };
let modules;
let url = new URL("./modules.json", import.meta.url);
if (url.protocol === "file:") {
	// We are in Node.js
	// fetch() doesn't work with file:// URLs
	const { readFileSync } = await import("fs");

	modules = JSON.parse(readFileSync(url));
}
else {
	modules = await (await fetch(url)).json();
}

let spaces = {};

modules.space = Object.fromEntries(modules.space.map(meta => [meta.id, meta]));

for (let id in ColorSpace.registry) {
	let space = ColorSpace.registry[id];
	let meta = spaces[id] = Object.assign(modules.space[id] ?? {}, {
		name: space.name,
		white: whitePoints.find(([name, white]) => white === space.white)?.[0] ?? "D65",
		base: space.base,
		coords: space.coords,
	});

	if (space.id != id) {
		meta.aliasOf = ColorSpace.registry[space.id].name;
	}

	for (let id in meta.coords) {
		let coord = meta.coords[id];
		let range = coord.range || coord.refRange;

		if (range) {
			coord.min = range[0];
			coord.max = range[1];
		}
	}
}

export default spaces;
