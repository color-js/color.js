import { lerp, lerpColorByHue } from "../utils.js";
import { fixColorSection } from "./fixColorSection.js";

/**
 * Generates and cleans a list of OKLCH colors that can be used as a lookup table.
 * @param rgbToOklch converter from RGB to OKLCH
 * @param lightness lightness of HSL transform (0.5 gives the most colorful colors)
 * @param steps intended number of steps in each hue region
 * @returns
 */
export function makeColorList (rgbToOklch, lightness, steps) {
	const hueRegions = [
		[0, 60], // red-yellow
		[60, 120], // yellow-green
		[120, 180], // green-cyan
		[180, 240], // cyan-blue
		[240, 300], // blue-magenta
		[300, 360], // magenta-red
	];

	const colorList = hueRegions
		// Generate a list of colors for each hue region
		.map(([hueStart, hueEnd]) => {
			return new Array(steps).fill(0).map((_, i) => {
				const hue = lerp(hueStart, hueEnd, i / (steps - 1));
				const [r, g, b] = hslToRgb(hue, 1, lightness);
				return rgbToOklch(r, g, b);
			});
		})
		.map((segment) => fixColorSection(segment))
		.map((segment) => filterInterpolatableColors(segment))
		.reduce((acc, val) => acc.concat(val.slice(0, -1)), []) // merge
		.sort((a, b) => a.h - b.h); // ascending sort by hue

	// Add 0 and 360 cusps
	return completeList(colorList);
}

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// Helpers

/** Converts HSL to RGB */
function hslToRgb (h, s, l) {
	h = h < 0 ? (h % 360) + 360 : h % 360;
	let m1 = l + s * (l < 0.5 ? l : 1 - l);
	let m2 = m1 - (m1 - l) * 2 * Math.abs(((h / 60) % 2) - 1);
	if (h < 60) {
		return [m1, m2, 2 * l - m1];
	}
	if (h < 120) {
		return [m2, m1, 2 * l - m1];
	}
	if (h < 180) {
		return [2 * l - m1, m1, m2];
	}
	if (h < 240) {
		return [2 * l - m1, m2, m1];
	}
	if (h < 300) {
		return [m2, 2 * l - m1, m1];
	}
	return [m1, 2 * l - m1, m2];
}

/** Adds the first (hue=0) and the last (hue=360) colors to the list */
function completeList (list) {
	const endColor = lerpColorByHue(
		list[list.length - 1],
		{ ...list[0], h: list[0].h + 360 },
		360,
	);
	return [{ ...endColor, h: 0 }, ...list, endColor];
}

/** Removes colors that could be lerped from neighbors */
function filterInterpolatableColors (colors, treshold = 0.00001) {
	const quadTreshold = treshold ** 2;
	let result = colors;
	let changed = true;

	while (changed) {
		const filtered = result.filter((color, idx, list) => {
			if (idx === 0 || idx === list.length - 1 || idx % 2 === 0) {
				return true;
			}
			const interpolated = lerpColorByHue(
				list[idx - 1],
				list[idx + 1],
				color.h,
			);
			const quadDistance =
				(color.l - interpolated.l) ** 2 + (color.c - interpolated.c) ** 2;
			return quadDistance > quadTreshold;
		});
		if (filtered.length === result.length) {
			changed = false;
		}
		else {
			result = filtered;
		}
	}

	return result;
}
