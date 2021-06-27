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
	classification: ['labish'],
    inGamut: coords => true,
	// Note that XYZ is relative to D65
    white: Color.whites.D65,
    XYZtoLMS_M: [
		[  0.8189330101,  0.3618667424,  -0.1288597137 ],
		[  0.0329845436,  0.9293118715,   0.0361456387 ],
		[  0.0482003018,  0.2643662691,   0.6338517070 ]
    ],
    // inverse of XYZtoLMS_M
    LMStoXYZ_M: [
        [  1.227013851103521026,    -0.5577999806518222383,  0.28125614896646780758  ],
        [ -0.040580178423280593977,  1.1122568696168301049, -0.071676678665601200577 ],
        [ -0.076381284505706892869, -0.42148197841801273055, 1.5861632204407947575   ]
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
	}
});


export default Color;
export {util};
