import Color, {util} from "./rec2020.js";

const rec2020 = Color.spaces.rec2020;

Color.defineSpace({
	// from Dolby, "WHAT IS ICTCP?"
	// https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf
	// and
	// Dolby, "Perceptual Color Volume
	// Measuring the Distinguishable Colors of HDR and WCG Displays"
	// https://professional.dolby.com/siteassets/pdfs/dolby-vision-measuring-perceptual-color-volume-v7.1.pdf
	id: "ictcp",
	name: "ICTCP",
	// From BT.2100-2 page 7:
	// During production, signal values are expected to exceed the
	// range E′ = [0.0 : 1.0]. This provides processing headroom and avoids
	// signal degradation during cascaded processing. Such values of E′,
	// below 0.0 or exceeding 1.0, should not be clipped during production
	// and exchange.
	// Values below 0.0 should not be clipped in reference displays (even
	// though they represent “negative” light) to allow the black level of
	// the signal (LB) to be properly set using test signals known as “PLUGE”
    coords: {
		I: [0, 1],			// Constant luminance
		CT: [-0.5, 0.5],	// Full BT.2020 gamut in range [-0.5, 0.5]
		CP: [-0.5, 0.5]
	},
	inGamut: coords => true,
	// Note that XYZ is relative to D65
	white: Color.whites.D65,
	c1: 3424 / 4096,
	c2: 2413 / 128,
	c3: 2392 / 128,
	m1: 2610 / 16384,
	m2: 2523 / 32,
	im1: 16384 / 2610,
	im2: 32 / 2523,
	// The matrix below includes the crosstalk components
	XYZtoLMS_M: [
		[ 0.3592,  0.6976, -0.0358],
		[-0.1922,  1.1004,  0.0755],
		[ 0.0070,  0.0749,  0.8434]
	],
	// linear-light Rec.2020 to LMS, again with crosstalk
	Rec2020toLMS_M: [
		[ 0.4120,  0.5239,  0.0641],
		[ 0.1667,  0.7204,  0.1129],
		[ 0.0241,  0.0755,  0.9004]
	],
	// this includes the Ebner LMS coefficients,
	// the rotation, and the scaling to [-0.5,0.5] range
	LMStoIPT_M: [
		[ 0.5,     0.5,     0     ],
		[ 1.6137, -3.3234,  1.7097],
		[ 4.3781  -4.2455  -0.1325]
	],
	// inverted matrices
	IPTtoLMS_M: [
		[0.99998889656284013833, 0.00860505014728705821,  0.1110343715986164786 ],
		[1.0000111034371598616, -0.00860505014728705821, -0.1110343715986164786 ],
		[1.000032063391005412,   0.56004913547279000113, -0.32063391005412026469],
	],
	LMStoRec2020_M: [
		[ 3.4375568932814012112,   -2.5072112125095058195,   0.069654319228104608382],
		[-0.79142868665644156125,   1.9838372198740089874,  -0.19240853321756742626 ],
		[-0.025646662911506476363, -0.099240248643945566751, 1.1248869115554520431  ]
	],
	LMStoXYZ_M: [
		[ 2.0701800566956135096,   -1.3264568761030210255,    0.20661600684785517081 ],
		[ 0.36498825003265747974,   0.68046736285223514102,  -0.045421753075853231409],
		[-0.049595542238932107896, -0.049421161186757487412,  1.1879959417328034394  ]
	],
	fromXYZ (XYZ) {

		const {XYZtoLMS_M, LMStoIPT_M, c1, c2, c3, m1, m2} = this;

		// Make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
		// Relative XYZ has Y=1 for media white
		// BT.2048 says media white Y=203 at PQ 58
		// This also does the D50 to D65 adaptation

		let [ Xa, Ya, Za ] = Color.spaces.absxyzd65.fromXYZ(XYZ);
		// console.log({Xa, Ya, Za});

		// move to LMS cone domain
		let LMS = util.multiplyMatrices(XYZtoLMS_M, [ Xa, Ya, Za ]);

		// apply the PQ EOTF
		let PQLMS = LMS.map (function (val) {
			let num = c1 + (c2 * ((val / 10000) ** m1));
			let denom = 1 + (c3 * ((val / 10000) ** m1));
			// console.log({val, num, denom});
			return (num / denom)  ** m2;
		});

		// LMS to IPT, with rotation for Y'C'bC'r compatibility
		return util.multiplyMatrices(LMStoIPT_M, PQLMS);
	},
	toXYZ (ICpCt) {

		const {LMStoXYZ_M, IPTtoLMS_M, c1, c2, c3, im1, im2} = this;

		let PQLMS = util.multiplyMatrices(IPTtoLMS_M, ICpCt);

		let LMS = PQLMS.map (function (val) {
			let num  = (val ** im2) - c1;
			let denom = ((c2 - (c3 * (val ** im2))) ** im1) * 10000;
			return (num / denom);
		});

		let XYZa = util.multiplyMatrices(LMStoXYZ_M, LMS);

		return Color.spaces.absxyzd65.toXYZ(XYZa);

	}
});
