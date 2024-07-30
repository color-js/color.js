import defaults from "./defaults.js";
import {isString} from "./util.js";
import deltaEMethods from "./deltaE/index.js";

// Type "imports"
/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").Methods} Methods */

/**
 *
 * @param {ColorTypes} c1
 * @param {ColorTypes} c2
 * @param {Methods | ({ method?: Methods | undefined } & Record<string, any>)} [o]
 * deltaE method to use as well as any other options to pass to the deltaE function
 * @returns {number}
 * @throws {TypeError} Unknown or unspecified method
 */
export default function deltaE (c1, c2, o = {}) {
	if (isString(o)) {
		o = {method: o};
	}

	let {method = defaults.deltaE, ...rest} = o;

	for (let m in deltaEMethods) {
		if ("deltae" + method.toLowerCase() === m.toLowerCase()) {
			return deltaEMethods[m](c1, c2, rest);
		}
	}

	throw new TypeError(`Unknown deltaE method: ${method}`);
}
