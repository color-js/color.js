import RGBColorSpace from "../RGBColorSpace.js";
// Same primaries and white point as Linear REC.2020, so it reuses its matrices
import { M } from "./rec2020-linear.js";

export { M };

export default new RGBColorSpace({
	id: "rec2100-linear",
	name: "Linear REC.2100",
	white: "D65",
	M,
	// Rec. 2100 is an HDR space: [0, 1] is the SDR range, but linear-light values
	// above 1 (brighter than diffuse white) are valid. So, unlike SDR RGB spaces,
	// we only provide a reference range (used for percentages), not a gamut range.
	coords: {
		r: {
			refRange: [0, 1],
			name: "Red",
		},
		g: {
			refRange: [0, 1],
			name: "Green",
		},
		b: {
			refRange: [0, 1],
			name: "Blue",
		},
	},
});
