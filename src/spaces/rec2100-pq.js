import RGBColorSpace from "../RGBColorSpace.js";
import REC_2100_Linear from "./rec2100-linear.js";

const Yw = 203; // absolute luminance of media white, cd/m²
const n = 2610 / 2 ** 14;
const ninv = 2 ** 14 / 2610;
const m = 2523 / 2 ** 5;
const minv = 2 ** 5 / 2523;
const c1 = 3424 / 2 ** 12;
const c2 = 2413 / 2 ** 7;
const c3 = 2392 / 2 ** 7;

export default new RGBColorSpace({
	id: "rec2100pq",
	cssId: "rec2100-pq",
	name: "REC.2100-PQ",
	base: REC_2100_Linear,
	toBase (RGB) {
		// given PQ encoded component in range [0, 1]
		// return media-white relative linear-light
		return RGB.map(function (val) {
			let x = (Math.max(val ** minv - c1, 0) / (c2 - c3 * val ** minv)) ** ninv;
			return (x * 10000) / Yw; // luminance relative to diffuse white, [0, 70 or so].
		});
	},
	fromBase (RGB) {
		// given media-white relative linear-light
		// returnPQ encoded component in range [0, 1]
		return RGB.map(function (val) {
			let x = Math.max((val * Yw) / 10000, 0); // absolute luminance of peak white is 10,000 cd/m².
			let num = c1 + c2 * x ** n;
			let denom = 1 + c3 * x ** n;

			return (num / denom) ** m;
		});
	},
});
