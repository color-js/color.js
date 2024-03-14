import { createApp } from "https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js";
import Color from "../../dist/color.js";
import Gradient from "./mapped-gradient.js";
import TimingInfo from "./timing-info.js";

globalThis.Color = Color;

let app = createApp({
	data () {
		let params = new URLSearchParams(location.search);
		const urlFromColor = params.get("from");
		const urlToColor = params.get("to");
		const from =  urlFromColor || "oklch(90% .8 250)";
		const to = urlToColor || "oklch(40% .1 20)";
		const methods = ["none", "chromium", "clip", "scale-lh", "css", "raytrace", "edge-seeker"];
		const runResults = {};
		methods.forEach(method => runResults[method] = []);
		return {
			methods: methods,
			from: from,
			to: to,
			parsedFrom: this.tryParse(from),
			parsedTo: this.tryParse(to),
			space: "oklch",
			maxDeltaE: 10,
			flush: false,
			params: params,
			interpolationSpaces: ["oklch", "oklab", "p3", "rec2020", "lab"],
			runResults: runResults,
		};
	},

	computed: {
		steps () {
			if ( !this.parsedFrom || !this.parsedTo) {
				return [];
			}
			const from = new Color(this.parsedFrom);
			let steps = from.steps(this.parsedTo, {
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
		colorChangeFrom (event) {
			this.parsedFrom = this.tryParse(event.detail.color) || this.parsedFrom;
		},
		colorChangeTo (event) {
			this.parsedTo = this.tryParse(event.detail.color) || this.parsedFrom;
		},
		tryParse (input) {
			try {
				const color = new Color.parse(input);
				return color;
			}
			catch (error) {
				// do nothing
			}
		},
		reportTime ({time, method}) {
			this.runResults[method].push(time);
			this.runResults = {...this.runResults};
		},
	},

	watch: {
		from: {
			handler (value) {
				this.params.set("from", value);
				history.pushState(null, "", "?" + this.params.toString());
			},
			deep: true,
			immediate: true,
		},
		to: {
			handler (value) {
				this.params.set("to", value);
				history.pushState(null, "", "?" + this.params.toString());
			},
			deep: true,
			immediate: true,
		},
	},

	components: {
		"mapped-gradient": Gradient,
		"timing-info": TimingInfo,
	},
	compilerOptions: {
		isCustomElement (tag) {
			return tag === "css-color";
		},
	},
}).mount(document.body);

globalThis.app = app;
