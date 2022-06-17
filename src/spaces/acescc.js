import RGBColorSpace from "../rgbspace.js";
import whites from "../whites.js";
import "../CATs.js"; // because of the funky whitepoint
import ACEScg from "./acescg.js";

const ε = 2 ** -16;

export default RGBColorSpace.create({
	id: "acescc",
	name: "ACEScc",
	// see S-2014-003 ACEScc – A Logarithmic Encoding of ACES Data
	// uses the AP1 primaries, see section 4.3.1 Color primaries

	// Appendix A: "Very small ACES scene referred values below 7 1/4 stops
	// below 18% middle gray are encoded as negative ACEScc values.
	// These values should be preserved per the encoding in Section 4.4
	// so that all positive ACES values are maintained."
	coords: {
		r: {
			range: [-0.3014, 1.468],
			name: "Red"
		},
		g: {
			range: [-0.3014, 1.468],
			name: "Green"
		},
		b: {
			range: [-0.3014, 1.468],
			name: "Blue"
		}
	},
	referred: "scene",

	base: ACEScg,
	// from section 4.4.2 Decoding Function
	toBase (RGB) {
		const low = (9.72 - 15) / 17.52; // -0.3014
		const high = (Math.log2(65504) + 9.72) / 17.52; // 1.468

		return RGB.map(function (val) {
			if (val <= low) {
				return (2 ** ((val * 17.52) - 9.72) - ε) * 2; // 0 for low or below
			}
			else if (val < high) {
				return 2 ** ((val * 17.52) - 9.72);
			}
			else { // val >= high
				return 65504;
			}
		});
	},

	// Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
	fromBase (RGB) {
		return RGB.map(function (val) {
			if (val <= 0) {
				return (Math.log2(ε) + 9.72) / 17.52; // -0.3584
			}
			else if (val < ε) {
				return  (Math.log2(ε + val * 0.5) + 9.72) / 17.52;
			}
			else { // val >= ε
				return  (Math.log2(val) + 9.72) / 17.52;
			}
		});
	},
	// encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
	// encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
});
