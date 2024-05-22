import Color from "../src/index.js";
import lch from "../src/spaces/lch.js";
import { check } from "./util.mjs";

export default {
	name: "Coordinate reading / writing tests",
	description: "These tests modify one or more coordinates and check the result.",
	check: check.deep(check.proximity({epsilon: .005})),
	data: {
		red: new Color("srgb", [1, 0, 0]),
		red_50: new Color("srgb", [1, 0, 0], .5),
		red_oklch: new Color("oklch", [.6, .25, 30]),
	},
	tests: [
		{
			name: "Reading coordinates",
			tests: [
				{
					name: "color.coords",
					run() {
						return this.data.red.coords;
					},
					expect: [1, 0, 0],
				},
				{
					name: "color.getAll()",
					run() {
						return this.data.red.getAll();
					},
					expect: [1, 0, 0],
				},
				{
					name: "color.alpha",
					run() {
						return this.data.red_50.alpha;
					},
					expect: 0.5,
				},
				{
					name: "color.coords[1]",
					run() {
						return this.data.red.coords[1];
					},
					expect: 0,
				},
				{
					name: "color.coordId",
					run() {
						return this.data.red_oklch.h;
					},
					expect: 30,
				},
				{
					name: "color.get(coordId)",
					run() {
						return this.data.red_oklch.get("h");
					},
					expect: 30,
				},
				{
					name: "color.otherSpace.coordId",
					run() {
						return this.data.red.oklch.h;
					},
					expect: 29.23,
				},
				{
					name: "color.get(otherSpace.coordId)",
					run() {
						return this.data.red.get("oklch.hue");
					},
					expect: 29.23,
				},
			]
		},
		{
			name: "Writing coordinates",
			tests: [
				{
					name: "color.coords = newCoords",
					run () {
						let color = new Color("srgb", [0, 1, 0]);
						color.coords = [1, 0, 1];
						return color.coords[2];
					},
					expect: 1,
				},
				{
					name: "color.coords[index] = value",
					run () {
						let color = this.data.red.clone();
						color.coords[1] = 0.5;
						return color.coords[1];
					},
					expect: 0.5,
				},
				{
					name: "color.alpha = value",
					run () {
						let color = this.data.red.clone();
						color.alpha = 0.5;
						return color.alpha;
					},
					expect: 0.5,
				},
				{
					name: "color.space.coordId = value",
					run () {
						let color = this.data.red.clone();
						color.lch.c = 13;
						return color.get("lch.c");
					},
					expect: 13,
				},
				{
					name: "color.set(coordId, value)",
					run () {
						let color = this.data.red.to("lch");
						color.set("c", 13);
						return color.lch.c;
					},
					expect: 13,
				},
				{
					name: "color.set(\"otherSpace.coordId\", value)",
					run () {
						let color = this.data.red.clone();
						color.set("lch.c", 13);
						return color.get("lch.c");
					},
					expect: 13,
				},
				{
					name: "color.space[index] = value",
					run () {
						let color = this.data.red.clone();
						color.lch[1] = 13;
						return color.lch.c;
					},
					expect: 13,
				},
				{
					name: "color.set(coordId, fn)",
					run () {
						let color = new Color("slategray").to("lch");
						color.set("c", c => c * 1.2);
						return color.lch.c;
					},
					expect: 13.480970445148008,
				},
				{
					name: "color.set(coordsObject)",
					run () {
						let color = this.data.red.clone();
						color.set({"lch.c": 13, "lch.l": 40});
						return [color.lch.c, color.lch.l];
					},
					expect: [13, 40],
				},
			],
		},
	],
};
