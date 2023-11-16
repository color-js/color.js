import Color from "../src/index.js";
import { check } from "./util.mjs";

export default {
	name: "Constructor tests",
	description: "hese tests check that the various constructor signatures work.",
	run (...args) {
		let color = new Color(...args);
		return color.toJSON();
	},
	check: check.deep(),
	tests: [
		{
			name: "Basic constructors",
			tests: [
				{
					name: "new Color(spaceId, coords)",
					tests: [
						{
							args: ["P3", [0, 1, 0]],
							expect: { "spaceId": "p3", "coords": [ 0, 1, 0 ], "alpha": 1 }
						},
						{
							args: ["rec2100pq", [0.34, 0.34, 0.34]],
							expect: { "spaceId": "rec2100pq", "coords": [ 0.34, 0.34, 0.34 ], "alpha": 1 }
						}
					]
				},
				{
					name: "new Color(keyword)",
					args: ["red"],
					expect: { "spaceId": "srgb", "coords": [ 1, 0, 0 ], "alpha": 1 }
				},
				{
					name: "new Color(hsl string)",
					args: ["hsl(10, 50%, 50%)"],
					expect: { "spaceId": "hsl", "coords": [ 10, 50, 50 ], "alpha": 1 }
				},
				{
					name: "new Color({spaceId, coords})",
					args: [{spaceId: "p3", coords: [0, 1, 0]}],
					expect: { "spaceId": "p3", "coords": [ 0, 1, 0 ], "alpha": 1 }
				},
			]
		}
	]
};
