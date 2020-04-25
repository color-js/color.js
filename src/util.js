import multiplyMatrices from "./multiply-matrices.js";

export function isString (str) {
	return Object.prototype.toString.call(str) === "[object String]";
}

// Like Object.assign() but copies property descriptors (including symbols)
export function extend (target, ...sources) {
	for (let source of sources) {
		if (source) {
			let descriptors = Object.getOwnPropertyDescriptors(source);
			Object.defineProperties(target, descriptors);
		}
	}

	return target;
}

export function copyDescriptor (target, source, prop) {
	let descriptor = Object.getOwnPropertyDescriptor(source, prop);
	Object.defineProperty(target, prop, descriptor);
}

export {multiplyMatrices};
