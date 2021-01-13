import Color from "./rec2020.js";

Color.defineSpace({
	inherits: "rec2020",
	id: "rec2100pq",
	cssid: "rec2100-pq",
	name: "REC.2100-PQ",
	Yw: 203,	// absolute luminance of media white, cd/m²
	n: 2610 / (2 ** 14),
	ninv: (2 ** 14) / 2610,
	m: 2523 / (2 ** 5),
	minv: (2 ** 5) / 2523,
	c1: 3424 / (2 ** 12),
	c2: 2413 / (2 ** 7),
	c3: 2392 / (2 ** 7),
	toLinear(RGB) {
	// given PQ encoded component in range [0, 1]
	// return media-white relative linear-light

		const {Yw, ninv, minv, c1, c2, c3} = this;

		return RGB.map(function (val) {
			let x = ((Math.max(((val ** minv) - c1), 0) / (c2 - (c3 * (val ** minv)))) ** ninv);
			return (x * 10000 / Yw); 	// luminance relative to diffuse white, [0, 70 or so].
		});
	},
	toGamma(RGB) {
	// given media-white relative linear-light
	// returnPQ encoded component in range [0, 1]

		const {Yw, n, m, c1, c2, c3} = this;

		return RGB.map(function (val) {
			let x = Math.max(val * Yw / 10000, 0); 	// absolute luminance of peak white is 10,000 cd/m².
			let num = (c1 + (c2 * (x ** n)));
			let denom = (1 + (c3 * (x ** n)));
			// console.log({x, num, denom});
			return ((num / denom)  ** m);
		});
	}
	// ,
	// // convert an array of linear-light rec2120 values to CIE XYZ
	// // using  D65 (no chromatic adaptation)
	// // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// // 0 is actually calculated as  4.994106574466076e-17
	// toXYZ_M: [
	// 	[0.6369580483012914, 0.14461690358620832,  0.1688809751641721],
	// 	[0.2627002120112671, 0.6779980715188708,   0.05930171646986196],
	// 	[0.000000000000000,  0.028072693049087428, 1.060985057710791]
	// ],
	// fromXYZ_M: [
	// 	[1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
	// 	[-0.6666843518324892,   1.6164812366349395,   0.01576854581391113],
	// 	[0.017639857445310783, -0.042770613257808524, 0.9421031212354738]
	// ]
});
