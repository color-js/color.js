/**
 * Relative luminance
 */
import get from "./get.js";
import set from "./set.js";
import xyz_d65 from "./spaces/xyz-d65.js";

export function getLuminance (color) {
	// Assume getColor() is called on color in get()
	return get(color, [xyz_d65, "y"]);
}

export function setLuminance (color, value) {
	// Assume getColor() is called on color in set()
	set(color, [xyz_d65, "y"], value);
}

export function register (Color) {
	Object.defineProperty(Color.prototype, "luminance", {
		get () {
			return getLuminance(this);
		},
		set (value) {
			setLuminance(this, value);
		},
	});
}
