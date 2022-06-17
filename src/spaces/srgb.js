import RGBColorSpace from "../rgbspace.js";
import sRGBLinear from "./srgb-linear.js";
import KEYWORDS from "../keywords.js";

export default RGBColorSpace.create({
	id: "srgb",
	name: "sRGB",
	base: sRGBLinear,
	fromBase: rgb => {
		// convert an array of linear-light sRGB values in the range 0.0-1.0
		// to gamma corrected form
		// https://en.wikipedia.org/wiki/SRGB
		return rgb.map(function (val) {
			let sign = val < 0? -1 : 1;
			let abs = Math.abs(val);

			if (abs > 0.0031308) {
				return sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055);
			}

			return 12.92 * val;
		});
	},
	toBase: rgb => {
		// convert an array of sRGB values in the range 0.0 - 1.0
		// to linear light (un-companded) form.
		// https://en.wikipedia.org/wiki/SRGB
		return rgb.map(function (val) {
			let sign = val < 0? -1 : 1;
			let abs = Math.abs(val);

			if (abs < 0.04045) {
				return val / 12.92;
			}

			return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
		});
	},
	formats: {
		functions: {
			"rgb": {
				coordsIn,
				coordsOut
			},
			"color": { /* use defaults */ },
			"rgba": {
				commas: true,
				lastAlpha: true,
				coordsIn,
				coordsOut
			}
		},
		custom: {
			"hex": {
				toGamut: true,
				test: str => /^#([a-f0-9]{3,4}){1,2}$/i.test(str),
				parse (str) {
					if (str.length <= 5) {
						// #rgb or #rgba, duplicate digits
						str = str.replace(/[a-f0-9]/gi, "$&$&");
					}

					let rgba = [];
					str.replace(/[a-f0-9]{2}/gi, component => {
						rgba.push(parseInt(component, 16) / 255);
					});

					return {
						spaceId: "srgb",
						coords: rgba.slice(0, 3),
						alpha: rgba.slice(3)[0]
					};
				},
				serialize: (coords, alpha, {
					collapse = true // collapse to 3-4 digit hex when possible?
				} = {}) => {
					if (alpha < 1) {
						coords.push(alpha);
					}

					coords = coords.map(c => Math.round(c * 255));

					let collapsible = collapse && coords.every(c => c % 17 === 0);

					let hex = coords.map(c => {
						if (collapsible) {
							return (c/17).toString(16);
						}

						return c.toString(16).padStart(2, "0");
					}).join("");

					return "#" + hex;
				}
			},
			"keyword": {
				test: str => /^[a-z]+$/i.test(str),
				parse (str) {
					str = str.toLowerCase();
					let ret = {spaceId: "srgb", coords: null, alpha: 1};

					if (str === "transparent") {
						ret.coords = KEYWORDS.black;
						ret.alpha = 0;
					}
					else {
						ret.coords = KEYWORDS[str];
					}

					if (ret.coords) {
						return ret;
					}
				}
			}
			// TODO keyword
		},
	}
});

function coordsIn (coords) {
	return coords.map(arg => arg.percentage? +arg : arg / 255);
}

function coordsOut (coords) {
	return coords.map(c => c * 100 + "%");
}