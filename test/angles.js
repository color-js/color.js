import {adjust} from "../src/angles.js";
import * as check from "../node_modules/htest.dev/src/check.js";

export default {
	name: "Angle pre-interpolation adjustment tests",
	description: "These tests test how angles adapt to different hue interpolation strategies.",
	run: adjust,
	check: check.deep(check.proximity({epsilon: .0005})),
	tests: [
		{
			args: [undefined, [-20, 380]],
			expect: [340, 20],
		},
		{
			args: ["increasing", [-20, 380]],
			expect: [340, 380],
		},
		{
			args: ["decreasing", [-20, 380]],
			expect: [340, 20],
		},
		{
			args: ["longer", [-20, 380]],
			expect: [340, 20],
		},
		{
			args: ["shorter", [-20, 380]],
			expect: [340, 380],
		},
		{
			args: ["raw", [-20, 380]],
			expect: [-20, 380],
		},
		{
			name: "Longer and Undefined",
			args: ["longer", [90, null]],
			expect: [90, 450],
		},
		{
			name: "Longer and Same Hues",
			args: ["longer", [90, 90]],
			expect: [90, 450],
		},
	],
};
