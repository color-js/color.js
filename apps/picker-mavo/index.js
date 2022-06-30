import Color from "../../color.js";
import {ColorSpace, to, serialize, inGamut, steps} from "../../src/index-fn.js";

// Expose Color.js functions as globals so we can easily reference them from Mavo
window.ColorSpace = ColorSpace;
window.color_to = function (...args) {
	// Drop proxies
	args = args.map(a => Mavo.clone(a));

	return to(...args);
};
window.color_serialize = function (...args) {
	// Drop proxies
	args = args.map(a => Mavo.clone(a));

	return serialize(...args);
};
window.color_inGamut = function (...args) {
	// Drop proxies
	args = args.map(a => Mavo.clone(a));

	return inGamut(...args);
};

window.getColorSpaces = () => ColorSpace.all.map(({id, name}) => ({id, name}));
window.getCoordMeta = (spaceId) => {
	// Drop proxy
	spaceId = Mavo.clone(spaceId);

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
};

window.getColorSpace = function (spaceId) {
	// Drop proxy
	spaceId = Mavo.clone(spaceId);

	return ColorSpace.get(spaceId);
}

window.getSliderSteps = function(spaceId, coords, coord_meta, alpha) {
	// Drop proxies
	spaceId = Mavo.clone(spaceId);
	coords = Mavo.clone(coords);
	coord_meta = Mavo.clone(coord_meta);
	alpha = Mavo.clone(alpha);

	alpha /= 100;

	let ret = [];

	for (let i=0; i<coord_meta.length; i++) {
		let {isHue, min, max} = coord_meta[i];

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
	let colorSteps = steps(color1, color2, {steps: 10}).map(c => serialize(c, {fallback: true})).join(", ");
	ret.push(colorSteps);

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

window.CSS_color_to_LCH = function CSS_color_to_LCH(str) {
	str = str || prompt("Enter any CSS color");

	if (!str) {
		return;
	}

	let app = Mavo.all.genericPicker;

	try {
		let color = new Color(str);
		let converted = color_to(color, spaceId.value);

		let coord_meta = [];
		for (let coords of converted.coords) {
			coord_meta.push({value: coords});
		}

		app.render({coord_meta, coords: converted.coords, alpha: converted.alpha * 100});
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
