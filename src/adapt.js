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
				[ 1.0479297925449969, 0.02294687060160968, -0.050192266289205256 ],
				[ 0.029627808770055882, 0.9904344267538799, -0.017073799063418806 ],
				[ -0.009243040646204511, 0.015055191490298221, 0.7518742814281371 ]
			];
		}
		else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) {

			env.M = [
				[ 0.947386632323667, 0.28196156725620036, -0.1708280666484637 ],
				[ -0.7357288996314816, 1.6804471734451398, 0.035992069603406264 ],
				[ 0.029218329379919382, -0.05145129980782719, 0.7733468362356041 ]
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
