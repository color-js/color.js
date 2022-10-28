import getColor from "./getColor.js";
import xyz_d65 from "./spaces/xyz-d65.js";
import to from "./to.js";

export default function over (source, backdrop, {
	space = xyz_d65,
	outputSpace = source.space,
} = {}) {
	source = getColor(source);
	backdrop = getColor(backdrop);

	let result;

	if (source.alpha === 0) {
		result = backdrop;
	}
	else if (source.alpha === 1 || backdrop.alpha === 0) {
		result = source;
	}
	else {
		let source_xyz = to(source, space);
		let backdrop_xyz = to(backdrop, space);
		result = {
			space,
			coords: source_xyz.map((s, i) => {
				let b = backdrop_xyz[i];
				return s + b * (1 - source.alpha);
			}),
			alpha: source.alpha + backdrop.alpha * (1 - source.alpha)
		}
	}

	return to(result, outputSpace);
}

export function register (Color) {
	Color.defineFunction("over", over, {returns: "color"});
}