import getColor from "./getColor.js";
import defaults from "./defaults.js";
import {isString} from "./util.js";
export const DELTAE_METHODS = {};

export default function deltaE (c1, c2, o = {}) {
	if (isString(o)) {
		o = {method: o};
	}

	let {method = defaults.deltaE, ...rest} = o;

	c1 = getColor(c1);
	c2 = getColor(c2);

	if (method in DELTAE_METHODS) {
		return DELTAE_METHODS[method](c1, c2, rest);
	}

	throw new TypeError(`Unknown deltaE method: ${method}`);
};

export function registerMethod(name, code) {
	let id = name.replace(/^deltaE/, "");
	DELTAE_METHODS[id] = code;
}

export function register(Color) {
	Color.defineFunction("deltaE", deltaE);

	for (let method in DELTAE_METHODS) {
		let methodName = "deltaE" + method;

		Color.defineFunction(methodName, function(c1, c2, o) {
			c1 = getColor(c1);
			return DELTAE_METHODS[method](c1, c2, o);
		});
	}
}