import ColorSpace from "../src/ColorSpace.js";
import srgbLinear, { M as srgbLinearM } from "../src/spaces/srgb-linear.js";
import p3Linear from "../src/spaces/p3-linear.js";
import oklab, { M as oklabM } from "../src/spaces/oklab.js";
import "../src/spaces/index.js"; // register all spaces

export default {
	name: "Color space matrix exports",
	description:
		"Color spaces should expose the matrices they use via their `M` property so consumer code can reuse them.",
	tests: [
		{
			name: "RGB color spaces expose their XYZ matrices",
			tests: [
				{
					name: "srgb-linear exposes toXYZ and fromXYZ",
					run: () => Object.keys(srgbLinear.M).sort(),
					expect: ["fromXYZ", "toXYZ"],
				},
				{
					name: "srgb-linear.M.fromXYZ is the inverse of toXYZ (round-trips to identity)",
					run: () => {
						let m = srgbLinear.M;
						// toXYZ · fromXYZ should be (approximately) the identity matrix
						let r0 =
							m.toXYZ[0][0] * m.fromXYZ[0][0] +
							m.toXYZ[0][1] * m.fromXYZ[1][0] +
							m.toXYZ[0][2] * m.fromXYZ[2][0];
						return Math.round(r0);
					},
					expect: 1,
				},
				{
					name: "p3-linear exposes toXYZ (previously not exported at all)",
					run: () => p3Linear.M.toXYZ[0].length,
					expect: 3,
				},
			],
		},
		{
			name: "Non-RGB color spaces expose their matrices",
			tests: [
				{
					name: "oklab exposes all four of its matrices",
					run: () => Object.keys(oklab.M).sort(),
					expect: ["LMStoLab", "LMStoXYZ", "LabtoLMS", "XYZtoLMS"],
				},
				{
					name: "oklab.M.XYZtoLMS is a 3×3 matrix",
					run: () => [oklab.M.XYZtoLMS.length, oklab.M.XYZtoLMS[0].length],
					expect: [3, 3],
				},
			],
		},
		{
			name: "Matrices are also available as a standalone `M` named export",
			tests: [
				{
					name: "the `M` named export is the same object as the space's `M`",
					run: () => srgbLinearM === srgbLinear.M && oklabM === oklab.M,
					expect: true,
				},
			],
		},
		{
			name: "Color spaces without matrices",
			tests: [
				{
					name: "A space with no matrices has an empty M object",
					run: () => {
						let space = new ColorSpace({
							id: "test-no-matrices",
							name: "Test",
							base: srgbLinear,
							coords: srgbLinear.coords,
							fromBase: c => c,
							toBase: c => c,
						});
						return typeof space.M === "object" && Object.keys(space.M).length;
					},
					expect: 0,
				},
				{
					name: "Custom matrices passed via options.M are exposed on the space",
					run: () => {
						let M = {
							custom: [
								[1, 0, 0],
								[0, 1, 0],
								[0, 0, 1],
							],
						};
						let space = new ColorSpace({
							id: "test-custom-matrices",
							name: "Test",
							base: srgbLinear,
							coords: srgbLinear.coords,
							M,
							fromBase: c => c,
							toBase: c => c,
						});
						return space.M.custom === M.custom;
					},
					expect: true,
				},
			],
		},
	],
};
