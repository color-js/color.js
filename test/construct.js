import Color from "../src/index.js";
import { check } from "./util.mjs";
import { isNone } from "../src/util.js";

export default {
	name: "Constructor tests",
	description: "hese tests check that the various constructor signatures work.",
	run (...args) {
		let color = new Color(...args);
		return color.toJSON();
	},
	check: check.deep(function (actual, expect) {
		if (expect === null || isNone(expect)) {
			// Treat NaN and null as equivalent for now
			return actual === null || isNone(actual);
		}

		return check.equals(actual, expect);
	}),
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
					name: "new Color(hsl string), none alpha",
					args: ["hsl(10, 50%, 50% / none)"],
					expect: { "spaceId": "hsl", "coords": [ 10, 50, 50 ], "alpha": NaN }
				},
				{
					name: "new Color({spaceId, coords})",
					args: [{spaceId: "p3", coords: [0, 1, 0]}],
					expect: { "spaceId": "p3", "coords": [ 0, 1, 0 ], "alpha": 1 }
				},
				{
					name: "new Color({spaceId, coords, alpha})",
					args: [{spaceId: "p3", coords: [0, 1, 0], alpha: 0.5}],
					expect: { "spaceId": "p3", "coords": [ 0, 1, 0 ], "alpha": 0.5 }
				},
				{
					name: "new Color({spaceId, coords, alpha}), clamp alpha",
					args: [{spaceId: "p3", coords: [0, 1, 0], alpha: 1000}],
					expect: { "spaceId": "p3", "coords": [ 0, 1, 0 ], "alpha": 1 }
				},
				{
					name: "new Color({spaceId, coords, alpha}), NaN alpha",
					args: [{spaceId: "p3", coords: [0, 1, 0], alpha: NaN}],
					expect: { "spaceId": "p3", "coords": [ 0, 1, 0 ], "alpha": NaN }
				},
			]
		}
	]
};
