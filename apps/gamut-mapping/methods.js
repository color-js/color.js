import Color from "../../dist/color.js";

const methods = {
	"clip": {
		label: "Clip",
		description: "Naïve clipping to the P3 gamut.",
	},
	"css": {
		label: "CSS",
		description: "CSS Color 4 gamut mapping method.",
	},
	"scale-lh": {
		label: "Scale LH",
		description: "Runs Scale, sets L, H to those of the original color, then runs Scale again.",
		compute: (color) => {
			let mappedColor = methods.scale.compute(color);
			let lch = color.to("oklch").coords;
			mappedColor.set({
				"oklch.l": lch[0],
				"oklch.h": lch[2],
			});
			return methods.scale.compute(mappedColor);
		},
	},
	"scale-lh-achromatic": {
		label: "Scale LH Achromatic",
		description: "Like Scale LH, but scales color towards the achromatic version of the color.",
		compute: (color) => {

			if (color.inGamut("p3", { epsilon: 0 })) {
				return color.to("p3");
			}

			let method = methods["scale-lh-achromatic"];
			let mapColor = color.to("oklch");
			let achroma = mapColor.clone().set("c", 0).to("p3-linear");
			let gamutColor = mapColor.clone().to("p3-linear");
			let lightness = mapColor.coords[0];
			let iterations = 3;

			if (lightness >= 1) {
				return new Color({ space: "xyz-d65", coords: WHITES["D65"] }).to("p3");
			}
			else if (lightness <= 0) {
				return new Color({ space: "xyz-d65", coords: [0, 0, 0] }).to("p3");
			}

			while (iterations--) {
				method.scale(gamutColor, achroma);
				gamutColor.set({
					"oklch.l": mapColor.coords[0],
					"oklch.h": mapColor.coords[2],
				});
			}

			return gamutColor.toGamut({method: "clip"}).to("p3");
		},

		lrgbToSrgb: (lrgb) => {
			// From Prismatic https://studylib.net/doc/14656976/the-prismatic-color-space-for-rgb-computations
			let rgb = lrgb.slice(1);
			let l = lrgb[0];
			let mx = Math.max(...rgb);
			if (mx != 0) {
				rgb = rgb.map((c, i) => {
					return (l * c) / mx;
				});
			}
			else {
				rgb = [0, 0, 0];
			}
			return rgb;
		},

		srgbToLrgb: (rgb) => {
			// To Prismatic https://studylib.net/doc/14656976/the-prismatic-color-space-for-rgb-computations
			let lrgb = [Math.max(...rgb)];
			let s = rgb.reduce((a, b) => a + b, 0);
			if (s != 0) {
				rgb.forEach((c, i) => {
					lrgb.push((c / s));
				});
			}
			else {
				lrgb = [lrgb[0], 0, 0, 0];
			}
			return lrgb;
		},

		lerp: (p0, p1, t) => {
			return p0 + (p1 - p0) * t;
		},

		ilerp: (p0, p1, t) => {
			let d = (p1 - p0);
			return d !== 0 ? ((t - p0) / d) : 0;
		},

		scale: (color, achroma) => {
			let delta = 0;
			let method = methods["scale-lh-achromatic"];
			let lrgb1 = method.srgbToLrgb(color.coords);
			let lrgb2 = method.srgbToLrgb(achroma.coords);
			let l = lrgb1[0];

			// Find the minimum required delta to get the color into gamut
			lrgb1.forEach((c, i) => {
				let d;
				if (c > 1) {
					d = method.ilerp(c, lrgb2[i], 1);
				}
				else if (c < 0) {
					d = method.ilerp(c, lrgb2[i], 0);
				}
				if (Math.abs(d) > Math.abs(delta)) {
					delta = d;
				}
			});

			// Scale non lightness components
			if (delta) {
				lrgb1 = lrgb1.map((c, i) => {
					return method.lerp(c, lrgb2[i], delta);
				});
				let rgb = method.lrgbToSrgb([l, ...lrgb1.slice(1)]);
				color.set({ r: rgb[0], g: rgb[1], b: rgb[2] });
			}
		},
	},
	"scale": {
		label: "Scale",
		description: "Using a midpoint of 0.5, scale the color to fit within the linear P3 gamut.",
		compute: (color) => {
			// Make in gamut range symmetrical around 0 [-0.5, 0.5] instead of [0, 1]
			let deltas = color.to("p3-linear").coords.map(c => c - .5);

			let maxDistance = Math.max(...deltas.map(c => Math.abs(c)));
			let scalingFactor = maxDistance / .5;

			let scaledCoords = deltas.map((delta, i) => {
				let scaled = delta / scalingFactor;
				return scaled + .5;
			});

			return new Color("p3-linear", scaledCoords).to("p3");
		},
	},
	// "scale125": {
	// 	label: "Scale from 0.125",
	// 	description: "Using a midpoint of 0.125 (perceptual midpoint per Oklab), scale the color to fit within the linear P3 gamut using different scaling factors for values below and above the midpoint.",
	// 	compute: (color) => {
	// 		let p3Linear = color.to("p3-linear");
	// 		let deltas = p3Linear.coords.map(c => c - .125); /* in-gamut range is now -.125 to .875 */
	// 		let max = [Math.min(...deltas.filter(c => c < 0)), Math.max(...deltas.filter(c => c > 0))];
	// 		let factor = [max[0] / .125, max[1] / .875];

	// 		let mapped = deltas.map((delta, i) => {
	// 			if (delta === 0) {
	// 				return .125;
	// 			}
	// 			else if (delta < 0) {
	// 				let scaled = delta / factor[0];
	// 				return scaled + .125;
	// 			}
	// 			else {
	// 				let scaled = delta / factor[1];
	// 				return scaled + .125;
	// 			}
	// 		});

	// 		return new Color("p3-linear", mapped).to("p3");
	// 	}
	// },
};

export default methods;
