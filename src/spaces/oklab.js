import Color, {util} from "./../color.js";

Color.defineSpace({
	id: "oklab",
	cssid: "oklab",
    name: "OKLab",
    coords: {
		L: [ 0, 1],
		a: [-0.5, 0.5],
		b: [-0.5, 0.5]
    },
    inGamut: coords => true,
	// Note that XYZ is relative to D65
    white: Color.whites.D65,
	// Recalculated for consistent reference white
	// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
    XYZtoLMS_M: [
		[ 0.8190224432164319,    0.3619062562801221,   -0.12887378261216414 ],
		[ 0.0329836671980271,    0.9292868468965546,     0.03614466816999844 ],
		[ 0.048177199566046255,  0.26423952494422764,    0.6335478258136937  ]
	],
    // inverse of XYZtoLMS_M
    LMStoXYZ_M: [
		[  1.2268798733741557,  -0.5578149965554813,   0.28139105017721583],
		[ -0.04057576262431372,  1.1122868293970594,  -0.07171106666151701],
		[ -0.07637294974672142, -0.4214933239627914,   1.5869240244272418 ]
],
    LMStoLab_M: [
		[  0.2104542553,   0.7936177850,  -0.0040720468 ],
		[  1.9779984951,  -2.4285922050,   0.4505937099 ],
		[  0.0259040371,   0.7827717662,  -0.8086757660 ]
	],
	// LMStoIab_M inverted
	LabtoLMS_M: [
        [ 0.99999999845051981432,  0.39633779217376785678,   0.21580375806075880339  ],
        [ 1.0000000088817607767,  -0.1055613423236563494,   -0.063854174771705903402 ],
        [ 1.0000000546724109177,  -0.089484182094965759684, -1.2914855378640917399   ]
    ],
	fromXYZ (XYZ) {
		const {XYZtoLMS_M, LMStoLab_M} = this;

		// move to LMS cone domain
		let LMS = util.multiplyMatrices(XYZtoLMS_M, XYZ);

		// non-linearity
		let LMSg = LMS.map (val => Math.cbrt(val));

		return (util.multiplyMatrices(LMStoLab_M, LMSg));

	},
	toXYZ (OKLab) {

		const {LMStoXYZ_M, LabtoLMS_M} = this;

		// move to LMS cone domain
		let LMSg = util.multiplyMatrices(LabtoLMS_M, OKLab);

		// restore linearity
		let LMS = LMSg.map (val => val ** 3);

		return (util.multiplyMatrices(LMStoXYZ_M, LMS));
	},
	parse (str, parsed = Color.parseFunction(str)) {
		if (parsed && parsed.name === "oklab") {
			return {
				spaceId: "oklab",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},
	instance: {
		toString ({format, ...rest} = {}) {
			if (!format) {
				format = (c, i) => i === 0? c * 100 + "%" : c;
			}

			return Color.prototype.toString.call(this, {name: "oklab", format, ...rest});
		}
	}
});


export default Color;
export {util};
