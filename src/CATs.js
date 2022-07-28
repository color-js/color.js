import hooks from "./hooks.js";
import {multiplyMatrices} from "./util.js";
import {WHITES} from "./adapt.js";

export const CATs = {};

hooks.add("chromatic-adaptation-start", env => {
	if (env.options.method) {
		env.M = adapt(env.W1, env.W2, env.options.method);
	}
});

hooks.add("chromatic-adaptation-end", env => {
	if (!env.M) {
		env.M = adapt(env.W1, env.W2, env.options.method);
	}
});

export function defineCAT ({id, toCone_M, fromCone_M}) {
	// Use id, toCone_M, fromCone_M like variables
	CATs[id] = arguments[0];
};

export function adapt (W1, W2, id = "Bradford") {
	// adapt from a source whitepoint or illuminant W1
	// to a destination whitepoint or illuminant W2,
	// using the given chromatic adaptation transform (CAT)
	// debugger;
	let method = CATs[id];

	let [ρs, γs, βs] = multiplyMatrices(method.toCone_M, W1);
	let [ρd, γd, βd] = multiplyMatrices(method.toCone_M, W2);

	// all practical illuminants have non-zero XYZ so no division by zero can occur below
	let scale = [
		[ρd/ρs,    0,      0      ],
		[0,        γd/γs,  0      ],
		[0,        0,      βd/βs  ]
	];
	// console.log({scale});

	let scaled_cone_M = multiplyMatrices(scale, method.toCone_M);
	let adapt_M	= multiplyMatrices(method.fromCone_M, scaled_cone_M);
	// console.log({scaled_cone_M, adapt_M});
	return adapt_M;
};

defineCAT({
	id: "von Kries",
	toCone_M: [
		[  0.4002400,  0.7076000, -0.0808100 ],
		[ -0.2263000,  1.1653200,  0.0457000 ],
		[  0.0000000,  0.0000000,  0.9182200 ]
	],
	fromCone_M: [
		[  1.8599364, -1.1293816,  0.2198974 ],
		[  0.3611914,  0.6388125, -0.0000064 ],
		[  0.0000000,  0.0000000,  1.0890636 ]
	]
});

defineCAT({
	id: "Bradford",
	// Convert an array of XYZ values in the range 0.0 - 1.0
	// to cone fundamentals
	toCone_M: [
		[  0.8951000,  0.2664000, -0.1614000 ],
		[ -0.7502000,  1.7135000,  0.0367000 ],
		[  0.0389000, -0.0685000,  1.0296000 ]
	],
	// and back
	fromCone_M: [
		[  0.9869929, -0.1470543,  0.1599627 ],
		[  0.4323053,  0.5183603,  0.0492912 ],
		[ -0.0085287,  0.0400428,  0.9684867 ]
	]
});

defineCAT({
	id: "CAT02",
	// with complete chromatic adaptation to W2, so D = 1.0
	toCone_M: [
		[  0.7328000,  0.4296000, -0.1624000 ],
		[ -0.7036000,  1.6975000,  0.0061000 ],
		[  0.0030000,  0.0136000,  0.9834000 ]
	],
	fromCone_M: [
		[  1.0961238, -0.2788690,  0.1827452 ],
		[  0.4543690,  0.4735332,  0.0720978 ],
		[ -0.0096276, -0.0056980,  1.0153256 ]
	]
});

defineCAT({
	id: "CAT16",
	toCone_M: [
		[  0.401288,  0.650173, -0.051461 ],
		[ -0.250268,  1.204414,  0.045854 ],
		[ -0.002079,  0.048952,  0.953127 ]
	],
	// the extra precision is needed to avoid roundtripping errors
	fromCone_M: [
		[  1.862067855087233e+0, -1.011254630531685e+0,   1.491867754444518e-1 ],
		[  3.875265432361372e-1,  6.214474419314753e-1,  -8.973985167612518e-3 ],
		[ -1.584149884933386e-2, -3.412293802851557e-2,   1.049964436877850e+0 ]
	]
});

Object.assign(WHITES, {
	// whitepoint values from ASTM E308-01 with 10nm spacing, 1931 2 degree observer
	// all normalized to Y (luminance) = 1.00000
	// Illuminant A is a tungsten electric light, giving a very warm, orange light.
	A:  [1.09850, 1.00000, 0.35585],

	// Illuminant C was an early approximation to daylight: illuminant A with a blue filter.
	C:   [0.98074, 1.000000, 1.18232],

	// The daylight series of illuminants simulate natural daylight.
	// The color temperature (in degrees Kelvin/100) ranges from
	// cool, overcast daylight (D50) to bright, direct sunlight (D65).
	D55: [0.95682, 1.00000, 0.92149],
	D75: [0.94972, 1.00000, 1.22638],

	// Equal-energy illuminant, used in two-stage CAT16
	E:   [1.00000, 1.00000, 1.00000],

	// The F series of illuminants represent fluorescent lights
	F2:  [0.99186, 1.00000, 0.67393],
	F7:  [0.95041, 1.00000, 1.08747],
	F11: [1.00962, 1.00000, 0.64350],
});
