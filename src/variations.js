import ColorSpace from "./space.js";
import set from "./set.js";

export function lighten (color, amount = .25) {
	let space = ColorSpace.get("oklch", "lch");
	let lightness = [space, "l"];
	return set(color, lightness, l => l * (1 + amount));
}

export function darken (color, amount = .25) {
	let space = ColorSpace.get("oklch", "lch");
	let lightness = [space, "l"];
	return set(color, lightness, l => l * (1 - amount));
}
