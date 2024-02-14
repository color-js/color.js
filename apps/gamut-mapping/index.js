import { createApp } from "https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js";
import Color from "../../dist/color.js";
import methods from "./methods.js";

globalThis.Color = Color;

const favicon = document.querySelector('link[rel="shortcut icon"]');
const lch = ["L", "C", "H"];
let spacesToShow = [Color.spaces.oklch, Color.spaces.p3, Color.spaces["p3-linear"]];

let app = createApp({
	data () {
		let params = new URLSearchParams(location.search);
		let defaultValue = "oklch(90% .8 250)";
		let colorInput = params.get("color") || defaultValue;
		let color;

		try {
			color = new Color(colorInput);
		}
		catch (e) {
			color = new Color("transparent");
		}

		return {
			color,
			colorNullable: color,
			colorInput,
			defaultValue,
			methods,
			params,
			Color,
			lch: ["L", "C", "H"],
		};
	},

	computed: {
		colorLCH () {
			return this.color.to("oklch");
		},

		spaces () {
			/*
			<div v-for="(c, i) of color.to(space).coords">
				<dt :title="coordInfo[spaceIndex][i][1].name">{{ coordInfo[spaceIndex][i][0].toUpperCase() }}</dt>
				<dd>{{ toPrecision(c, 3) }}</dd>
			</div>
			*/
			return spacesToShow.map(space => {
				let coordInfo = Object.entries(space.coords);
				let coords = this.color.to(space).coords.map(c => this.toPrecision(c, 3));
				return {
					name: space.name,
					coords: Object.fromEntries(coordInfo.map(([c, info], i) => [c, {value: coords[i], name: info.name, id: c}]))
				};
			});
		},

		mapped () {
			return Object.fromEntries(Object.entries(this.methods).map(([method, config]) => {
				let mappedColor;
				if (config.compute) {
					mappedColor = config.compute(this.color);
				}
				else {
					mappedColor = this.color.clone().toGamut({ space: "p3", method });
				}

				let mappedColorLCH = mappedColor.to("oklch");
				let deltas = {E: this.toPrecision(this.color.deltaE(mappedColor, { method: "2000" }), 2)};

				lch.forEach((c, i) => {
					let delta = mappedColorLCH.coords[i] - this.colorLCH.coords[i];

					if (c === "L") {
						// L is percentage
						delta *= 100;
					}
					else if (c === "H") {
						// Hue is angular, so we need to normalize it
						delta = ((delta % 360) + 720) % 360;
						delta = Math.min(360 - delta, delta);
					}

					delta = this.toPrecision(delta, 2);
					deltas[c] = delta;
				});

				return [method, {color: mappedColor, deltas}];
			}));
		},

		minDeltas () {
			let ret = {};
			for (let method in this.mapped) {
				let {deltas} = this.mapped[method];

				for (let c in deltas) {
					let delta = Math.abs(deltas[c]);
					let minDelta = ret[c];

					if (!minDelta || minDelta >= delta) {
						ret[c] = delta;
					}
				}
			}
			return ret;
		},

		ranking () {
			let deltaEs = Object.entries(this.mapped).map(([method, {deltas}]) => deltas.E);
			deltaEs = deltaEs.map(e => this.toPrecision(e, 2));
			deltaEs.sort((a, b) => a - b);
			return deltaEs;
		}
	},

	methods: {
		toPrecision: Color.util.toPrecision,
		abs: Math.abs
	},

	watch: {
		colorNullable () {
			if (this.colorNullable === null) {
				// Probably typing
				return;
			}

			this.color = this.colorNullable;
		},

		colorInput: {
			handler (value) {
				// Update URL to create a permalink
				let hadColor = this.params.has("color");

				if (!value || value !== this.defaultValue) {
					this.params.set("color", value);
				}
				else {
					this.params.delete("color");
				}

				history[hadColor == this.params.has("color") ? "replaceState" : "pushState"](null, "", "?" + this.params.toString());

				// Update favicon
				favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${ encodeURIComponent(value) }" /></svg>`;

				// Update title
				document.title = value + " • Gamut Mapping Playground";
			},
			immediate: true,
		}
	},

	isCustomElement (el) {
		return el.tagName.toLowerCase() !== "css-color";
	}
}).mount(document.body);

globalThis.app = app;
