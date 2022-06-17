import RGBColorSpace from "../rgbspace.js";
import whites from "../whites.js";
import "../CATs.js"; // because of the funky whitepoint

// The ACES whitepoint
// see TB-2018-001 Derivation of the ACES White Point CIE Chromaticity Coordinates
// also https://github.com/ampas/aces-dev/blob/master/documents/python/TB-2018-001/aces_wp.py
// Similar to D60
whites.ACES = [0.32168/0.33767, 1.00000, (1.00000 - 0.32168 - 0.33767)/0.33767];

// convert an array of linear-light ACEScc values to CIE XYZ
const toXYZ_M = [
	[  0.6624541811085053,   0.13400420645643313,  0.1561876870049078  ],
	[  0.27222871678091454,  0.6740817658111484,   0.05368951740793705 ],
	[ -0.005574649490394108, 0.004060733528982826, 1.0103391003129971  ]
];
const fromXYZ_M = [
	[  1.6410233796943257,   -0.32480329418479,    -0.23642469523761225  ],
	[ -0.6636628587229829,    1.6153315916573379,   0.016756347685530137 ],
	[  0.011721894328375376, -0.008284441996237409, 0.9883948585390215   ]
];

export default RGBColorSpace.create({
	id: "acescg",
	name: "ACEScg",

	// ACEScg – A scene-referred, linear-light encoding of ACES Data
	// uses the AP1 primaries, see section 4.3.1 Color primaries
	coords: {
		r: {
			range: [0, 2 ** 16],
			name: "Red"
		},
		g: {
			range: [0, 2 ** 16],
			name: "Green"
		},
		b: {
			range: [0, 2 ** 16],
			name: "Blue"
		}
	},
	// Appendix A: "Very small ACES scene referred values below 7 1/4 stops
	// below 18% middle gray are encoded as negative ACEScc values.
	// These values should be preserved per the encoding in Section 4.4
	// so that all positive ACES values are maintained."

	white: whites.ACES,

	toXYZ_M,
	fromXYZ_M
});

// export default Color;
