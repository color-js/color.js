import { createApp } from "https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js";
import Color from "../../dist/color.js";
import methods from "./methods.js";
import Gradient from "./mapped-gradient.js";

globalThis.Color = Color;

let app = createApp({
	data () {
		let params = new URLSearchParams(location.search);
		let urlFromColor = params.getAll("from").filter(Boolean);
		let urlToColor = params.getAll("to").filter(Boolean);
		return {
			methods: ["none", "clip", "scale-lh", "css", "raytrace", "edge-seeker"],
			Color,
			from: "oklch(90% .8 250)",
			to: "oklch(40% .1 20)",
			space: "oklch",
			maxDeltaE: 10,
			flush: false,
			interpolationSpaces: ["oklch", "oklab", "p3", "rec2020", "lab"],
		};
	},

	computed: {
		colors () {
			return [this.from, this.to];
		},

		steps () {
			const from = new Color(this.colors[0]);
			const to = new Color(this.colors[1]);
			let steps = from.steps(to, {
				maxDeltaE: this.maxDeltaE,
				space: this.space,
			});
			return steps;
		},
		oogSteps () {
			return this.steps.map(step => {
				switch (true) {
					case step.inGamut("srgb"):
						return ["in srgb", "yellowgreen"];
					case step.inGamut("p3"):
						return ["in p3", "gold"];
					case step.inGamut("rec2020"):
						return ["in rec2020", "orange"];
					default:
						return ["out of rec2020", "red"];
				}
			});
		},
	},

	methods: {

	},

	watch: {

	},

	components: {
		"mapped-gradient": Gradient,
	},
	compilerOptions: {
		isCustomElement (tag) {
			return tag === "css-color";
		},
	},
}).mount(document.body);

globalThis.app = app;
