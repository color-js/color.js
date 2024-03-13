import Color from "../src/index.js";
import { check } from "./util.mjs";

export default {
	name: "Hooks Tests",
	description: "TBD",
	check: check.deep(),
	tests: [
		{
			name: "sRGB to LCH",
			tests: [
				{
					name: "parse-start",
					run: () => {
						Color.hooks.add("parse-start", env => {
							if (env.str === "foo") {
								return env.color = {spaceId: "sRGB", coords: [1, .5, .5]};
							}
						});

						return new Color("foo").toJSON();
					},
					expect: { "spaceId": "srgb", "coords": [ 1, 0.5, 0.5 ], "alpha": 1 },
				},
			],
		},
	],
};
