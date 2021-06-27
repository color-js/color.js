import Color, {util} from "./../color.js";

Color.defineSpace({
	id: "jzazbz",
	cssid: "Jzazbz",
    name: "Jzazbz",
    coords: {
		Jz: [0, 1],
		az: [-0.5, 0.5],
		bz: [-0.5, 0.5]
	},
	classification: ['labish'],
    inGamut: coords => true,
	// Note that XYZ is relative to D65
	white: Color.whites.D65,
	b: 1.15,
	g: 0.66,
	n:2610 / (2 ** 14),
	ninv: (2 ** 14) / 2610,
	c1: 3424 / (2 ** 12),
	c2: 2413 / (2 ** 7),
	c3: 2392 / (2 ** 7),
	p: 1.7 * 2523 / (2 ** 5),
	pinv: (2 ** 5) / (1.7 * 2523),
	d: -0.56,
	d0: 1.6295499532821566E-11,
	XYZtoCone_M: [
		[  0.41478972, 0.579999,  0.0146480 ],
		[ -0.2015100,  1.120649,  0.0531008 ],
		[ -0.0166008,  0.264800,  0.6684799 ]
	],
	// XYZtoCone_M inverted
	ConetoXYZ_M: [
		[  1.9242264357876067,  -1.0047923125953657,  0.037651404030618   ],
		[  0.35031676209499907,  0.7264811939316552, -0.06538442294808501 ],
		[ -0.09098281098284752, -0.3127282905230739,  1.5227665613052603  ]
	],
	ConetoIab_M: [
		[  0.5,       0.5,       0        ],
		[  3.524000, -4.066708,  0.542708 ],
		[  0.199076,  1.096799, -1.295875 ]
	],
	// ConetoIab_M inverted
	IabtoCone_M: [
		[ 1,                   0.1386050432715393,   0.05804731615611886 ],
		[ 0.9999999999999999, -0.1386050432715393,  -0.05804731615611886 ],
		[ 0.9999999999999998, -0.09601924202631895, -0.8118918960560388  ]
	],
    fromXYZ (XYZ) {

		const {b, g, n, p, c1, c2, c3, d, d0, XYZtoCone_M, ConetoIab_M} = this;

		// First make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
		// Relative XYZ has Y=1 for media white
		// BT.2048 says media white Y=203 at PQ 58

		// console.log({XYZ});

		let [ Xa, Ya, Za ] = Color.spaces.absxyzd65.fromXYZ(XYZ);
		// console.log({Xa, Ya, Za});


		// modify X and Y
		let Xm = (b * Xa) - ((b - 1) * Za);
		let Ym = (g * Ya) - ((g - 1) * Xa);
		// console.log({Xm, Ym, Za});

		// move to LMS cone domain
		let LMS = util.multiplyMatrices(XYZtoCone_M, [ Xm, Ym, Za ]);
		// console.log({LMS});

		// PQ-encode LMS
		let PQLMS = LMS.map (function (val) {
			let num = c1 + (c2 * ((val / 10000) ** n));
			let denom = 1 + (c3 * ((val / 10000) ** n));
			// console.log({val, num, denom});
			return (num / denom)  ** p;
		});
		// console.log({PQLMS});

		// almost there, calculate Iz az bz
		let [ Iz, az, bz] = util.multiplyMatrices(ConetoIab_M, PQLMS);
		// console.log({Iz, az, bz});

		let Jz = ((1 + d) * Iz) / (1 + (d * Iz)) - d0;
		return [Jz, az, bz];

    },
    toXYZ(Jzazbz) {

		const {b, g, ninv, pinv, c1, c2, c3, d, d0, ConetoXYZ_M, IabtoCone_M} = this;

		let [Jz, az, bz] = Jzazbz;
		let Iz = (Jz + d0) / (1 + d - d * (Jz + d0));
		// console.log({Iz});

		// bring into LMS cone domain
		let PQLMS = util.multiplyMatrices(IabtoCone_M, [ Iz, az, bz ]);
		// console.log({PQLMS});

		// convert from PQ-coded to linear-light
		let LMS = PQLMS.map(function (val){
			let num = (c1 - (val ** pinv));
			let denom = (c3 * (val ** pinv)) - c2;
			let x = 10000 * ((num / denom) ** ninv);
			// console.log({x, num, denom})
			return (x); 	// luminance relative to diffuse white, [0, 70 or so].
		});
		// console.log({LMS});

		// modified abs XYZ
		let [ Xm, Ym, Za ] = util.multiplyMatrices(ConetoXYZ_M, LMS);
		// console.log({sXm, Ym, Za});

		// restore standard D50 relative XYZ, relative to media white
		let Xa = (Xm + ((b -1) * Za)) / b;
		let Ya = (Ym + ((g -1) * Xa)) / g;
		return Color.spaces.absxyzd65.toXYZ([ Xa, Ya, Za ]);
    },
	parse (str, parsed = Color.parseFunction(str)) {
		if (parsed && parsed.name === "jzabz") {
			return {
				spaceId: "jzazbz",
				coords: parsed.args.slice(0, 3),
				alpha: parsed.args.slice(3)[0]
			};
		}
	},
	instance: {
		toString ({format, ...rest} = {}) {
			return Color.prototype.toString.call(this, {name: "jzazbz", format, ...rest});
		}
	}
});

export default Color;
export {util};
