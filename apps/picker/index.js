import Color from "../../color.js";
import {createApp} from "https://unpkg.com/vue@3.2.37/dist/vue.esm-browser.js";

let app = createApp({
	data() {
		return {
			alpha: 100,
			decimals: 3,
			spaceId: "lch",
			color_spaces: Color.Space.registry,
			coords: [50, 50, 50],
		};
	},
	computed: {
		space () {
			return Color.Space.get(this.spaceId);
		},
		coord_meta () {
			return Object.entries(this.space.coords).map(([id, meta]) => {
				let {name, range, refRange} = meta;
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
			return this.color.toString({fallback: true});
		},
		color_srgb () {
			return this.color.to('srgb');
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
				ret.push(steps.map(c => c.toString({fallback: true})).join(", "));
			}

			// Push alpha too
			let color1 = new Color(spaceId, coords, 0);
			let color2 = new Color(spaceId, coords, 1);
			let steps = Color.steps(color1, color2, {steps: 10}).map(c => c.toString({fallback: true})).join(", ");
			ret.push(steps);

			return ret;
		}
	},
	watch: {
		spaceId (newSpaceId, oldSpaceId) {
			if (newSpaceId != oldSpaceId) {
				let coords = Color.Space.get(oldSpaceId).to(newSpaceId, this.coords);
				this.coords = coords;
			}
		}
	}
}).mount('#app')

const supportsP3 = self.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
window.supportsP3 = supportsP3;

window.getColor = function(...args) {
	let color = new Color(...args);
	return color;
}

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
