import xyz_d65 from "./spaces/xyz-d65.js";
import Color from "./color.js";

// Chromaticity coordinates
export function uv (color) {
	let [X, Y, Z] = color.getAll(xyz_d65);
	let denom = X + 15 * Y + 3 * Z;
	return [4 * X / denom, 9 * Y / denom];
}

export function xy (color) {
	let [X, Y, Z] = color.getAll(xyz_d65);
	let  sum = X + Y + Z;
	return [X / sum, Y / sum];
}

export function register(Color) {
	// no setters, as lightness information is lost
	// when converting color to chromaticity
	Object.defineProperty(Color.prototype, "uv", {
		get () {
			return uv(this);
		}
	});

	Object.defineProperty(Color.prototype, "xy", {
		get () {
			return xy(this);
		}
	});
}
