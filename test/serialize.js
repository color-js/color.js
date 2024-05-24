import "../src/spaces/index.js";
import serialize from "../src/serialize.js";

const tests = {
	name: "Color serialization Tests",
	description: "These tests parse different color formats and compare the result as JSON",
	run (spaceId, coords, alpha) {
		return serialize({spaceId, coords, alpha});
	},
	tests: [
		{
			args: ["srgb", [1, 0.5, 0]],
			expect: "rgb(100% 50% 0%)",
		}
	],
};

export default tests;
