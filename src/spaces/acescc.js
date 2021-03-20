import Color from "../color.js";
import "../CATs.js";
// because of the funky whitepoint

Color.defineSpace({
	id: "acescc",
	name: "ACEScc",
	inherits: "srgb",

	// see S-2014-003 ACEScc – A Logarithmic Encoding of ACES Data
	// uses the AP1 primaries, see section 4.3.1 Color primaries
	coords: {
		red:   [-0.3014, 1.468],
		green: [-0.3014, 1.468],
		blue:  [-0.3014, 1.468]
	},
	// Appendix A: "Very small ACES scene referred values below 7 1/4 stops
	// below 18% middle gray are encoded as negative ACEScc values.
	// These values should be preserved per the encoding in Section 4.4
	// so that all positive ACES values are maintained."

	// The ACES whitepoint
	// see TB-2018-001 Derivation of the ACES White Point CIE Chromaticity Coordinates
	// also https://github.com/ampas/aces-dev/blob/master/documents/python/TB-2018-001/aces_wp.py
	white: Color.whites.ACES = [0.32168/0.33767, 1.00000, (1.00000 - 0.32168 - 0.33767)/0.33767],
	// Similar to D60

	// from section 4.4.2 Decoding Function
	toLinear(RGB) {

		const low = (9.72 - 15) / 17.52; // -0.3014
		const high = (Math.log2(65504) + 9.72) / 17.52; // 1.468
		const ε = 2 ** -16;

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
	toGamma(RGB) {

		const ε = 2 ** -16;

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

	// convert an array of linear-light ACEScc values to CIE XYZ
	toXYZ_M: [
		[  0.6624541811085053,   0.13400420645643313,  0.1561876870049078  ],
		[  0.27222871678091454,  0.6740817658111484,   0.05368951740793705 ],
		[ -0.005574649490394108, 0.004060733528982826, 1.0103391003129971  ]
	],
	//
	fromXYZ_M: [
		[  1.6410233796943257,   -0.32480329418479,    -0.23642469523761225  ],
		[ -0.6636628587229829,    1.6153315916573379,   0.016756347685530137 ],
		[  0.011721894328375376, -0.008284441996237409, 0.9883948585390215   ]
	]
});

// export default Color;
