import Color from "../src/index.js";
import { check } from "./util.mjs";

export default {
	name: "Color modification tests",
	description: "These tests modify one or more coordinates and check the result.",
	check: check.deep(check.proximity({epsilon: .005})),
	tests: [
		{
			name: "sRGB to LCH",
			tests: [
				{
					name: "color.lch.c = 13",
					run: () => {
						var color = new Color("slategray");
						color.lch.c = 13;
						return color.lch.c;
					},
					expect: 13,
				},
				{
					name: "color.set('lch.c', 13)",
					run: () => {
						var color = new Color("slategray");
						color.set("lch.c", 13);
						return color.get("lch.c");
					},
					expect: 13,
				},
				{
					name: "color.lch[1] = 13",
					run: () => {
						var color = new Color("slategray");
						color.lch[1] = 13;
						return color.lch.c;
					},
					expect: 13,
				},
				{
					name: "color.set('c', 13)",
					run: () => {
						var color = new Color("slategray").to("lch");
						color.set("c", 13);
						return color.lch.c;
					},
					expect: 13,
				},
				{
					name: "color.set({'lch.c': 13, 'lch.l': 40})",
					run: () => {
						var color = new Color("slategray");
						color.set({"lch.c": 13, "lch.l": 40});
						return [color.lch.c, color.lch.l];
					},
					expect: [13, 40],
				},
				{
					name: "color.set('lch.c', 13)",
					run: () => {
						var color = new Color("slategray");
						color.set("lch.c", 13);
						return color.lch.c;
					},
					expect: 13,
				},
				{
					name: "chroma *= 1.2",
					run: () => {
						var color = new Color("slategray");
						color.lch.c *= 1.2;
						return color.lch.c;
					},
					expect: 13.480970445148008,
				},
				{
					name: "color.set('c', c => c * 1.2)",
					run: () => {
						var color = new Color("slategray").to("lch");
						color.set("c", c => c * 1.2);
						return color.lch.c;
					},
					expect: 13.480970445148008,
				},
				{
					name: "c *= 1.25",
					run: () => {
						var color = new Color("slategray").to("lch");
						color.lch.c *= 1.25;
						var lch = color.lch;
						return [lch[0], lch[1], lch[2]];
					},
					expect: [52.69726799102946, 14.04267594002497, 253.0004426214531],
				},
			],
		},
	],
};
