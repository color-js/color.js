import Color, {util} from "./../color.js";

/**
 * sRGB
 *
 * @see https://webstore.iec.ch/publication/6169 IEC 61966-2-1:1996
 * @see https://www.w3.org/Graphics/Color/sRGB.html
 * @see http://color.org/chardata/rgb/sRGB.pdf
 */
Color.defineSpace({
	id: "srgb",
	name: "sRGB",
	coords: {
		red: [0, 1],
		green: [0, 1],
		blue: [0, 1]
	},
	white: Color.whites.D65,
	α: 1.055,
	a /* = α - 1 */: 0.055,
	β /* = E_t */: 0.0031308 /* 0.0031308049535... */,
	γ /* > 1 */: 12/5 /* = 2.4 */,
	Γ /* = 1/γ < 1 */: 5/12 /* = 0.41_6 */,
	φ /* = δ */: 12.92 /* exact IEC value, elsewhere 12.920020442059... */,
	K₀ /* = β*δ = β*φ */: 0.04045 /* exact IEC value, elsewhere 0.040449936... or 0.0404482... */,
	// theoretically purer values would have been: K₀ = 11/280 ≈ 0.03928..., φ = 12.92321..., β = 0.00304...
	
	// convert an array of sRGB values in the range 0.0 - 1.0
	// to linear light (un-companded) form.
	// https://en.wikipedia.org/wiki/SRGB
	toLinear(RGB) {
		const {α, a, φ, γ, K₀} = this;
		return RGB.map(function (val) {
			return (val < K₀) ? val / φ : Math.pow((val + a) / α , γ);
		});
	},
	// convert an array of linear-light sRGB values in the range 0.0-1.0
	// to gamma corrected form
	// https://en.wikipedia.org/wiki/SRGB
	toGamma(RGB) {
		const {α, a, φ, Γ, β} = this;
		return RGB.map(function (val) {
			return (val <= β) ? val * φ : Math.pow(val, Γ) * α - a;
		});
	},

	toXYZ_M: [
		[ 0.4124564,  0.3575761,  0.1804375 ],
		[ 0.2126729,  0.7151522,  0.0721750 ],
		[ 0.0193339,  0.1191920,  0.9503041 ]
	],
	fromXYZ_M: [
		[ 3.2404542, -1.5371385, -0.4985314 ],
		[-0.9692660,  1.8760108,  0.0415560 ],
		[ 0.0556434, -0.2040259,  1.0572252 ]
	],
	// convert an array of sRGB values to CIE XYZ
	// using sRGB's own white, D65 (no chromatic adaptation)
	// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
	// also
	// https://www.image-engineering.de/library/technotes/958-how-to-convert-between-srgb-and-ciexyz
	toXYZ(rgb) {
		rgb = this.toLinear(rgb);

		return util.multiplyMatrices(this.toXYZ_M, rgb);
	},
	fromXYZ(XYZ) {
		return this.toGamma(util.multiplyMatrices(this.fromXYZ_M, XYZ));
	},
	// Properties added to Color.prototype
	properties: {
		toHex({
			alpha = true, // include alpha in hex?
			collapse = true // collapse to 3-4 digit hex when possible?
		} = {}) {
			let coords = this.to("srgb", {inGamut: true}).coords;

			if (this.alpha < 1 && alpha) {
				coords.push(this.alpha);
			}

			coords = coords.map(c => Math.round(c * 255));

			let collapsible = collapse && coords.every(c => c % 17 === 0);

			let hex = coords.map(c => {
				return collapsible ? (c/17).toString(16) : c.toString(16).padStart(2, "0");
			}).join("");

			return "#" + hex;
		},

		get hex() {
			return this.toHex();
		}
	},
	// Properties present only on sRGB colors
	instance: {
		toString ({inGamut = true, commas, format = "%", ...rest} = {}) {
			if (format === 255) {
				format = c => c * 255;
			}
			else if (format === "hex") {
				return this.toHex(arguments[0]);
			}

			return Color.prototype.toString.call(this, {
				inGamut, commas, format,
				name: "rgb" + (commas && this.alpha < 1? "a" : ""),
				...rest
			});
		}
	}
});

export default Color;
export {util};
