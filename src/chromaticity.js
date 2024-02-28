import xyz_d65 from "./spaces/xyz-d65.js";
import getAll from "./getAll.js";

// Chromaticity coordinates
export function uv (color) {
	// Assumes getAll() calls getColor() on color
	let [X, Y, Z] = getAll(color, xyz_d65);
	let denom = X + 15 * Y + 3 * Z;
	return [4 * X / denom, 9 * Y / denom];
}

export function xy (color) {
	// Assumes getAll() calls getColor() on color
	let [X, Y, Z] = getAll(color, xyz_d65);
	let  sum = X + Y + Z;
	return [X / sum, Y / sum];
}

export function register (Color) {
	// no setters, as lightness information is lost
	// when converting color to chromaticity
	Object.defineProperty(Color.prototype, "uv", {
		get () {
			return uv(this);
		},
	});

	Object.defineProperty(Color.prototype, "xy", {
		get () {
			return xy(this);
		},
	});
}
