import Color from "../../color.js";
import {parse, ColorSpace, to, serialize, inGamut, steps} from "../../src/index-fn.js";

// Expose Color.js functions as globals so we can easily reference them from Mavo
window.ColorSpace = ColorSpace;
window.color_to = to;
window.color_serialize = serialize;
window.color_inGamut = inGamut;

window.getColorSpaces = () => ColorSpace.all.map(({id, name}) => ({id, name}));
window.getCoordMeta = (spaceId) => {
	let space = ColorSpace.get(spaceId);
	return Object.entries(space.coords).map(([id, meta]) => {
		let {name, range, refRange} = meta;
		range = range || refRange || [0, 100];
		name = name || id;
		let [min, max] = range;
		let step = (max - min) / 100;
		if (step > 1) {
			step = 1;
		}

		let isHue = id === "h" && meta.type === "angle";

		return { id, name, isHue, min, max, step };
	});
}

window.getSliderSteps = function(spaceId, coords, coord_meta, alpha) {
	return "";
	alpha /= 100;

	let ret = [];

	for (let i=0; i<this.coord_meta.length; i++) {
		let {range, isHue, min, max} = coord_meta[i];

		let start = coords.slice();
		start[i] = min;
		let color1 = {spaceId, coords: start, alpha};

		let end = coords.slice();
		end[i] = max;
		let color2 = {spaceId, coords: end, alpha};

		let interpolationOptions = {space: spaceId, steps: 10};

		if (isHue) {
			interpolationOptions.hue = "raw";
		}

		let steps = Color.steps(color1, color2, interpolationOptions);
		ret.push(steps.map(c => c.toString({fallback: true})).join(", "));
	}

	// Push alpha too
	let color1 = {spaceId, coords, alpha: 0};
	let color2 = {spaceId, coords, alpha: 1};
	let steps = steps(color1, color2, {steps: 10}).map(c => serialize(c, {fallback: true})).join(", ");
	ret.push(steps);

	return ret;
}

let handle;
document.body.addEventListener("mv-change", evt => {
	if (evt.property === "css_color") {
		cancelIdleCallback(handle);
		handle = requestIdleCallback(() => {
			// Update favicon
			let serialized = encodeURIComponent(css_color.value);
			favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" r="10" fill="${serialized}" /></svg>`;
		});
	}
	else if (evt.property === "spaceId") {
		document.title = `${spaceId.selectedOptions[0].label} color picker`;
	}
});

let app = {
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

		},
		color (...args) {
			return new Color(this.spaceId, this.coords, this.alpha / 100);
		},
		css_color () {
			let css_color = this.color.toString({fallback: true});



			return css_color;
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
				let newSpace = Color.Space.get(newSpaceId);
				let coords = Color.Space.get(oldSpaceId).to(newSpace, this.coords);
				this.coords = coords;

				document.title = `${newSpace.name} color picker`;
			}
		},
	}
};

window.CSS_color_to_LCH = function CSS_color_to_LCH(str) {
	str = str || prompt("Enter any CSS color");

	if (!str) {
		return;
	}

	let app = Mavo.all.genericPicker;

	try {
		let color = parse(str);
		let converted = color_to(color, app.root.children.spaceId.value);

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
