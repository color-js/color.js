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

	"scale-lh-achromatic2": {
		label: "Scale LH Achromatic 2",
		description: (
			"Like Scale LH Achromatic but applies 3 passes: 2X approaching gamut and final scaling into gamut."
		),
		compute: (color) => {
			if (color.inGamut("p3")) {
				return color.to("p3");
			}
			let method = methods["scale-achromatic"];
			let mapColor = color.to("oklch");
			let achroma = mapColor.clone().set("c", 0).to("p3-linear");
			let gamutColor = mapColor.clone().to("p3-linear");
			let lightness = mapColor.coords[0];

			if (lightness >= 1) {
				return new Color({ space: "xyz-d65", coords: WHITES["D65"] }).to("p3");
			}
			else if (lightness <= 0) {
				return new Color({ space: "xyz-d65", coords: [0, 0, 0] }).to("p3");
			}

			let iterate = 2;
			while (iterate--) {
				let chroma = mapColor.coords[1];
				method.scale(gamutColor, achroma);
				let chroma2 = gamutColor.oklch.c;
				mapColor.set("c", ((chroma2 - chroma) < 2) ? method.lerp(chroma, chroma2, 0.9) : chroma2 + 0.1);
				let [red, green, blue] = mapColor.to("p3-linear").coords;
				gamutColor.set({r: red, g: green, b: blue});
			}

			method.scale(gamutColor, achroma);
			return gamutColor.to("p3");
		},
	},

	"scale-lh-achromatic": {
		label: "Scale LH Achromatic",
		description: "Like Scale LH but uses Scale Achromatic and returns black or white if L<=0 or L>=1.",
		compute: (color) => {
			let method = methods["scale-achromatic"];
			let mapColor = color.to("oklch");
			let achroma = mapColor.clone().set("c", 0).to("p3-linear");
			let gamutColor = mapColor.clone().to("p3-linear");
			let lightness = mapColor.coords[0];

			if (lightness >= 1) {
				return new Color({ space: "xyz-d65", coords: WHITES["D65"] }).to("p3");
			}
			else if (lightness <= 0) {
				return new Color({ space: "xyz-d65", coords: [0, 0, 0] }).to("p3");
			}

			method.scale(gamutColor, achroma);
			gamutColor.set({
				"oklch.l": mapColor.coords[0],
				"oklch.h": mapColor.coords[2],
			});
			method.scale(gamutColor, achroma);
			return gamutColor.to("p3");
		},
	},

	"scale-achromatic": {
		label: "Scale Achromatic",
		"description": "Scale towards the achromatic version of the given color.",
		compute: (color) => {
			let mapColor = color.to("oklch");
			let achroma = mapColor.clone().set("c", 0).to("p3-linear");
			let gamutColor = mapColor.clone().to("p3-linear");
			let lightness = mapColor.coords[0];
			methods["scale-achromatic"].scale(gamutColor, achroma);
			return gamutColor.to("p3");
		},

		lerp: (p0, p1, t) => {
			return p0 + (p1 - p0) * t;
		},

		ilerp: (p0, p1, t) => {

			let d = (p1 - p0);
			return d !== 0 ? ((t - p0) / d) : 0;
		},

		scale: (color, achroma) => {
			let deltas = [];
			let method = methods["scale-achromatic"];
			color.coords.forEach((c, i) => {
				if (c > 1) {
					deltas.push(method.ilerp(c, achroma.coords[i], 1));
				}
				else if (c < 0) {
					deltas.push(method.ilerp(c, achroma.coords[i], 0));
				}
			});

			if (deltas.length > 0) {
				const maxDelta = Math.max(...deltas);
				color.set({
					r: method.lerp(color.coords[0], achroma.coords[0], maxDelta),
					g: method.lerp(color.coords[1], achroma.coords[1], maxDelta),
					b: method.lerp(color.coords[2], achroma.coords[2], maxDelta),
				});
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
