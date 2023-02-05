import getColor from "./getColor.js";
import defaults from "./defaults.js";
import {isString} from "./util.js";
import deltaEMethods from "./deltaE/index.js";

export default function deltaE (c1, c2, o = {}) {
	if (isString(o)) {
		o = {method: o};
	}

	let {method = defaults.deltaE, ...rest} = o;

	c1 = getColor(c1);
	c2 = getColor(c2);

	for (let m in deltaEMethods) {
		if ("deltae" + method.toLowerCase() === m.toLowerCase()) {
			return deltaEMethods[m](c1, c2, rest);
		}
	}

	throw new TypeError(`Unknown deltaE method: ${method}`);
};
