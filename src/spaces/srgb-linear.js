import RGBColorSpace from "../RGBColorSpace.js";

/** @import { Matrix3x3 } from "../types.js" */

// This is the linear-light version of sRGB
// as used for example in SVG filters
// or in Canvas

// This matrix was calculated directly from the RGB and white chromaticities
// when rounded to 8 decimal places, it agrees completely with the official matrix
// see https://github.com/w3c/csswg-drafts/issues/5922
/** @type {Matrix3x3} */
// prettier-ignore
const toXYZ_M = [
	[ 0.41239079926595934, 0.357584339383878,   0.1804807884018343  ],
	[ 0.21263900587151027, 0.715168678767756,   0.07219231536073371 ],
	[ 0.01933081871559182, 0.11919477979462598, 0.9505321522496607  ],
];

// This matrix is the inverse of the above;
// again it agrees with the official definition when rounded to 8 decimal places
/** @type {Matrix3x3} */
// prettier-ignore
export const fromXYZ_M = [
	[  3.2409699419045226,  -1.537383177570094,   -0.4986107602930034  ],
	[ -0.9692436362808796,   1.8759675015077202,   0.04155505740717559 ],
	[  0.05563007969699366, -0.20397695888897652,  1.0569715142428786  ],
];

export default new RGBColorSpace({
	id: "srgb-linear",
	name: "Linear sRGB",
	white: "D65",
	toXYZ_M,
	fromXYZ_M,
});
