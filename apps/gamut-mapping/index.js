import { createApp } from "https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js";
import Color from "../../dist/color.js";
import methods from "./methods.js";
import MapColor from "./map-color.js";

globalThis.Color = Color;

const favicon = document.querySelector('link[rel="shortcut icon"]');

let app = createApp({
	data () {
		let params = new URLSearchParams(location.search);
		let urlColors = params.getAll("color").filter(Boolean);
		let defaultValue = "oklch(90% .8 250)";
		let colors = urlColors.length > 0 ? urlColors : [defaultValue];

		return {
			colors,
			defaultValue,
			methods,
			params,
			Color,
			lch: ["L", "C", "H"],
		};
	},

	computed: {
	},

	methods: {
		toPrecision: Color.util.toPrecision,
		abs: Math.abs,
	},

	watch: {
		colors: {
			handler (value) {
				// Update URL to create a permalink
				let hadColor = this.params.has("color");
				this.params.delete("color");
				let colors = value.filter(c => c && c !== this.defaultValue);

				if (colors.length > 0) {
					colors.forEach(c => this.params.append("color", c));
				}

				history[hadColor == this.params.has("color") ? "replaceState" : "pushState"](null, "", "?" + this.params.toString());

				// Update favicon
				let rects = colors.map((c, i) => `<rect y="${ i * 100 / colors.length }%" width="100%" height="${ 100 / colors.length }%" fill="${ encodeURIComponent(c) }" />`);
				favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg">${ rects }</svg>`;

				// Update title
				document.title = value.join(", ") + " • Gamut Mapping Playground";
			},
			immediate: true,
			deep: true,
		},
	},

	components: {
		"map-color": MapColor,
	},
}).mount(document.body);

globalThis.app = app;
