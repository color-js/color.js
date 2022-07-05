import Color from "../../color.js";
import {createApp} from "https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.prod.js";

if (!globalThis.requestIdleCallback) {
	globalThis.requestIdleCallback = globalThis.requestAnimationFrame;
}

let app = createApp({
	data() {
		let ret = {
			alpha: 100,
			precision: 3,
			spaceId: "lch",
			color_spaces: Color.Space.all,
			coords: [50, 50, 50],
		};

		if (localStorage.picker_color) {
			let o = JSON.parse(localStorage.picker_color);
			Object.assign(ret, o);
		}

		let spaceId = location.pathname.match(/\/picker\/([\w-]*)/)?.[1] || new URL(location).searchParams.get("space");

		if (spaceId && spaceId !== ret.spaceId) {
			ret.coords = new Color(ret.spaceId, ret.coords, ret.alpha / 100).to(spaceId, {inGamut: true}).coords;
			ret.spaceId = spaceId;
		}

		let space = Color.Space.get(ret.spaceId);

		document.title = `${space.name} color picker`;

		return ret;
	},
	computed: {
		space () {
			return Color.Space.get(this.spaceId);
		},
		coord_meta () {
			return Object.entries(this.space.coords).map(([id, meta]) => {
				let {name, range, refRange} = meta;
				name = name || id;
				range = range || refRange || [0, 100];
				let [min, max] = range;
				let step = (max - min) / 100;
				if (step > 1) {
					step = 1;
				}

				let isHue = id === "h" && meta.type === "angle";

				return { id, name, isHue, min, max, step };
			});
		},
		color (...args) {
			return new Color(this.spaceId, this.coords, this.alpha / 100);
		},
		css_color () {
			requestIdleCallback(() => {
				let serialized = encodeURIComponent(this.css_color);
				favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" r="10" fill="${serialized}" /></svg>`;
			});

			return this.color.display({precision: this.precision}) + "";
		},
		color_srgb () {
			return this.color.to('srgb');
		},
		serialized_color () {
			return this.color.toString({precision: this.precision});
		},
		serialized_color_srgb () {
			return this.color_srgb.toString({precision: this.precision});
		},
		serialized_color_srgb_oog () {
			return this.color_srgb.toString({precision: this.precision, inGamut: false});
		},
		slider_steps () {
			let {spaceId, coords, coord_meta, alpha} = this;
			alpha /= 100;

			let ret = [];

			for (let i=0; i<this.coord_meta.length; i++) {
				let {range, isHue, min, max} = coord_meta[i];

				let start = coords.slice();
				start[i] = min;
				let color1 = new Color(spaceId, start, alpha);

				let end = coords.slice();
				end[i] = max;
				let color2 = new Color(spaceId, end, alpha);

				let interpolationOptions = {space: spaceId, steps: 10};

				if (isHue) {
					interpolationOptions.hue = "raw";
				}

				let steps = Color.steps(color1, color2, interpolationOptions);
				ret.push(steps.map(c => c.display()).join(", "));
			}

			// Push alpha too
			let color1 = new Color(spaceId, coords, 0);
			let color2 = new Color(spaceId, coords, 1);
			let steps = Color.steps(color1, color2, {steps: 10}).map(c => c.display()).join(", ");
			ret.push(steps);

			return ret;
		}
	},
	watch: {
		spaceId (newSpaceId, oldSpaceId) {
			if (newSpaceId != oldSpaceId) {
				let newSpace = Color.Space.get(newSpaceId);
				let coords = Color.Space.get(oldSpaceId).to(newSpace, this.coords);
				this.coords = coords;

				document.title = `${newSpace.name} color picker`;
				let url = new URL(location);
				url.pathname = url.pathname.replace(/\/picker\/[\w-]*/, `/picker/${newSpaceId}`);
				history.pushState(null, "", url.href);
			}
		},

		color (newColor) {
			requestIdleCallback(() => {
				let {spaceId, coords, alpha} = this;
				localStorage.picker_color = JSON.stringify({spaceId, coords, alpha});
			});
		}
	}
}).mount('#app')

window.CSS_color_to_LCH = function CSS_color_to_LCH(str) {
	str = str || prompt("Enter any CSS color");

	if (!str) {
		return;
	}

	try {
		let color = new Color(str);
		let converted = color.to(app.spaceId);
		app.coords = converted.coords;
		app.alpha = converted.alpha * 100;
	}
	catch (e) {
		alert(e.message);
		return;
	}
}

// Select text in readonly input fields when you focus them
document.addEventListener("click", evt => {
	if (evt.target.matches("input[readonly]")) {
		evt.target.select();
	}
});
