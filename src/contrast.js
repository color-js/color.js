import getColor from "./getColor.js";
// import defaults from "./defaults.js";
import {isString} from "./util.js";
import * as contrastAlgorithms from "./contrast/index.js";

export default function contrast (background, foreground, o = {}) {
	if (isString(o)) {
		o = {algorithm: o};
	}

	let {algorithm, ...rest} = o;

	if (!algorithm) {
		let algorithms = Object.keys(contrastAlgorithms).map(a => a.replace(/^contrast/, "")).join(", ");
		throw new TypeError(`contrast() function needs a contrast algorithm. Please specify one of: ${algorithms}`);
	}

	background = getColor(background);
	foreground = getColor(foreground);

	for (let a in contrastAlgorithms) {
		if ("contrast" + algorithm.toLowerCase() === a.toLowerCase()) {
			return contrastAlgorithms[a](background, foreground, rest);
		}
	}

	throw new TypeError(`Unknown contrast algorithm: ${algorithm}`);
}
