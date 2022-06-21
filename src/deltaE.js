import Color from "./color.js";
import {isString} from "./util.js";
export const DELTAE_METHODS = {};

export function deltaE (c1, c2, o = {}) {
	if (isString(o)) {
		o = {method: o};
	}

	let {method = Color.defaults.deltaE, ...rest} = o;

	c1 = Color.get(c1);
	c2 = Color.get(c2);

	if (method in DELTAE_METHODS) {
		return DELTAE_METHODS[method](c1, c2, rest);
	}

	throw new TypeError(`Unknown deltaE method: ${method}`);
};

export function register(method, func) {
	if (method) {
		DELTAE_METHODS[method] = func;
	}

	let methodName = "deltaE" + method;

	// Add instance method
	Color.prototype[methodName] = function(c2, o) {
		c2 = Color.get(c2);
		return func(this, c2, o);
	};

	return Color[methodName] = function(c1, c2, o) {
		c1 = Color.get(c1);
		return c1[methodName](c2, o);
	}
}