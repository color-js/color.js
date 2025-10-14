import ColorSpace from "../ColorSpace.js";
import XYZ_D65 from "./xyz-d65.js";

const Yw = 203; // absolute luminance of media white

export default new ColorSpace({
	// Absolute CIE XYZ, with a D65 whitepoint,
	// as used in most HDR colorspaces as a starting point.
	// SDR spaces are converted per BT.2048
	// so that diffuse, media white is 203 cd/m²
	id: "xyz-abs-d65",
	cssId: "--xyz-abs-d65",
	name: "Absolute XYZ D65",
	coords: {
		x: {
			refRange: [0, 9504.7],
			name: "Xa",
		},
		y: {
			refRange: [0, 10000],
			name: "Ya",
		},
		z: {
			refRange: [0, 10888.3],
			name: "Za",
		},
	},

	base: XYZ_D65,
	fromBase (XYZ) {
		// Make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
		// Relative XYZ has Y=1 for media white
		return XYZ.map(v => v * Yw);
	},
	toBase (AbsXYZ) {
		// Convert to media-white relative XYZ
		return AbsXYZ.map(v => v / Yw);
	},
});
