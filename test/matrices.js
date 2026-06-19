import ColorSpace from "../src/ColorSpace.js";
import srgbLinear, { fromXYZ_M } from "../src/spaces/srgb-linear.js";
import p3Linear from "../src/spaces/p3-linear.js";
import oklab, { LMStoLab_M, LabtoLMS_M } from "../src/spaces/oklab.js";
import "../src/spaces/index.js"; // register all spaces

export default {
	name: "Color space matrices (ColorSpace.M)",
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
					name: "srgb-linear.M.fromXYZ is the same matrix as the exported fromXYZ_M",
					run: () => srgbLinear.M.fromXYZ === fromXYZ_M,
					expect: true,
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
					name: "oklab.M references the same matrix objects as the named exports",
					run: () => oklab.M.LMStoLab === LMStoLab_M && oklab.M.LabtoLMS === LabtoLMS_M,
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
