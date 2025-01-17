import * as util from "./util.js";

/**
 * Constrain an angle to 360 degrees
 * @param {number} angle
 * @returns {number}
 */
export function constrain (angle) {
	if (typeof angle !== "number") {
		return angle;
	}

	return ((angle % 360) + 360) % 360;
}

/**
 * @param {"raw" | "increasing" | "decreasing" | "longer" | "shorter"} arc
 * @param {[number, number]} angles
 * @returns {[number, number]}
 */
export function adjust (arc, angles) {
	let [a1, a2] = angles;

	let none1 = util.isNone(a1);
	let none2 = util.isNone(a2);

	if (none1 && none2) {
		return [a1, a2];
	}
	else if (none1) {
		a1 = a2;
	}
	else if (none2) {
		a2 = a1;
	}

	if (arc === "raw") {
		return angles;
	}

	a1 = constrain(a1);
	a2 = constrain(a2);

	let angleDiff = a2 - a1;

	if (arc === "increasing") {
		if (angleDiff < 0) {
			a2 += 360;
		}
	}
	else if (arc === "decreasing") {
		if (angleDiff > 0) {
			a1 += 360;
		}
	}
	else if (arc === "longer") {
		if (-180 < angleDiff && angleDiff < 180) {
			if (angleDiff > 0) {
				a1 += 360;
			}
			else {
				a2 += 360;
			}
		}
	}
	else if (arc === "shorter") {
		if (angleDiff > 180) {
			a1 += 360;
		}
		else if (angleDiff < -180) {
			a2 += 360;
		}
	}

	return [a1, a2];
}
