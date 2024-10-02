import ColorSpace from "../src/spaces/index.js";
import {WHITES} from "../src/adapt.js";

let whitePoints = Object.entries(WHITES);

// 11ty chokes on this
// import modules from "./modules.json" with { type: "json" };
import { readFileSync } from "fs";
const modules = JSON.parse(readFileSync("data/modules.json"));

let spaces = {};

for (let meta of modules.space) {
	let id = meta.id;
	let space = ColorSpace.registry[id];

	spaces[id] = meta;
	Object.assign(meta, {
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
