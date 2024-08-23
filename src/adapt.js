import hooks from "./hooks.js";
import {multiply_v3_m3x3} from "./util.js";

// Type "imports"
/** @typedef {import("./types.js").White} White */

/** @type {Record<string, White>} */
export const WHITES = {
	// for compatibility, the four-digit chromaticity-derived ones everyone else uses
	D50: [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585],
	D65: [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290],
};

/**
 *
 * @param {string | White} name
 * @returns {White}
 */
export function getWhite (name) {
	if (Array.isArray(name)) {
		return name;
	}

	return WHITES[name];
}

/**
 * Adapt XYZ from white point W1 to W2
 * @param {White | string} W1
 * @param {White | string} W2
 * @param {[number, number, number]} XYZ
 * @param {{ method?: string | undefined }} options
 * @returns {[number, number, number]}
 */
export default function adapt (W1, W2, XYZ, options = {}) {
	W1 = getWhite(W1);
	W2 = getWhite(W2);

	if (!W1 || !W2) {
		throw new TypeError(`Missing white point to convert ${!W1 ? "from" : ""}${!W1 && !W2 ? "/" : ""}${!W2 ? "to" : ""}`);
	}

	if (W1 === W2) {
		// Same whitepoints, no conversion needed
		return XYZ;
	}

	let env = {W1, W2, XYZ, options};

	hooks.run("chromatic-adaptation-start", env);

	if (!env.M) {
		if (env.W1 === WHITES.D65 && env.W2 === WHITES.D50) {
			env.M = [
				[ 1.0479297925449969, 0.022946870601609652, -0.05019226628920524 ],
				[ 0.02962780877005599, 0.9904344267538799, -0.017073799063418826 ],
				[ -0.009243040646204504, 0.015055191490298152, 0.7518742814281371 ],
			];
		}
		else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) {

			env.M = [
				[ 0.955473421488075, -0.02309845494876471, 0.06325924320057072 ],
				[ -0.0283697093338637, 1.0099953980813041, 0.021041441191917323 ],
				[ 0.012314014864481998, -0.020507649298898964, 1.330365926242124 ],
			];
		}
	}

	hooks.run("chromatic-adaptation-end", env);

	if (env.M) {
		return multiply_v3_m3x3(env.XYZ, env.M);
	}
	else {
		throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
	}
}
