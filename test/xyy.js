import Color from "../src/index.js";
import * as check from "../node_modules/htest.dev/src/check.js";

const tests = {
	name: "xyY color space",
	check: check.deep((actual, expect) =>
		check.shallowEquals({ epsilon: 0.000001, subset: true })(actual, expect)),
	tests: [
		{
			name: "D65 white has the reference chromaticity",
			run: () => new Color("white").to("xyy").coords,
			expect: [0.3127, 0.329, 1],
		},
		{
			name: "xyY converts back to XYZ",
			run: () => new Color("xyy", [0.3127, 0.329, 1]).to("xyz-d65").coords,
			expect: [0.9504559270516717, 1, 1.0890577507598784],
		},
		{
			name: "xyY parses through the color() syntax",
			run: () => new Color("color(xyy 0.3127 0.329 1)").coords,
			expect: [0.3127, 0.329, 1],
		},
		{
			name: "black uses the chromaticity origin",
			run: () => new Color("black").to("xyy").coords,
			expect: [0, 0, 0],
		},
	],
};

export default tests;
