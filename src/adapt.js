import hooks from "./hooks.js";
import {multiplyMatrices} from "./util.js";

export const WHITES = {
	// for compatibility, the four-digit chromaticity-derived ones everyone else uses
	D50: [0.3457 / 0.3585, 1.00000, (1.0 - 0.3457 - 0.3585) / 0.3585],
	D65: [0.3127 / 0.3290, 1.00000, (1.0 - 0.3127 - 0.3290) / 0.3290],
};

export function getWhite (name) {
	if (Array.isArray(name)) {
		return name;
	}

	return WHITES[name];
}

// Adapt XYZ from white point W1 to W2
export default function adapt (W1, W2, XYZ, options = {}) {
	W1 = getWhite(W1);
	W2 = getWhite(W2);

	if (!W1 || !W2) {
		throw new TypeError(`Missing white point to convert ${!W1? "from" : ""}${!W1&&!W2? "/" : ""}${!W2? "to" : ""}`);
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
				[  1.0479298208405488,    0.022946793341019088,  -0.05019222954313557 ],
				[  0.029627815688159344,  0.990434484573249,     -0.01707382502938514 ],
				[ -0.009243058152591178,  0.015055144896577895,   0.7518742899580008  ]
			];
		}
		else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) {

			env.M = [
				[  0.9554734527042182,   -0.023098536874261423,  0.0632593086610217   ],
				[ -0.028369706963208136,  1.0099954580058226,    0.021041398966943008 ],
				[  0.012314001688319899, -0.020507696433477912,  1.3303659366080753   ]
			];
		}
	}

	hooks.run("chromatic-adaptation-end", env);

	if (env.M) {
		return multiplyMatrices(env.M, env.XYZ);
	}
	else {
		throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
	}
}
