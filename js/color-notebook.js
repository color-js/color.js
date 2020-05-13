/**
* Color notebook: Interactive color examples
* Idea credit: chroma.js
* Author: Lea Verou
*/

let $ = Bliss, $$ = $.$;
import Color, {util} from "../color.js";

const supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
const outputSpace = supportsP3? "p3" : "srgb";
const varDeclaration = /\b(?:let|var)\s*([\w]+)\s*=/;

function evaluate(pre) {
	let wrapper = pre.closest(".cn-wrapper");
	let results = $(".cn-results", wrapper);
	let value = pre.textContent;

	// Remove comments
	value = value.replace(/\s*\/\/.+$/gm, "").trim();

	// Remove last semicolon
	value = value.replace(/;$/, "").trim();

	// Split by semicolon
	let lines = value.split(/\s*;\s*/);

	var variable;
	var colors = {};
	var code = "";

	// CLear previous results
	results.textContent = "";

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		code += line + ";";
		let ret;

		try {
			ret = eval(code);
		}
		catch (e) {
			ret = e;
			// console.log(ret, line);
		}

		if (ret instanceof Error) {
			continue;
		}

		if (ret === undefined) {
			// var foo returns undefined, print it out
			variable = line.match(varDeclaration);

			if (variable) {
				variable = variable[1];

				try {
					ret = eval(code + variable);
				}
				catch (e) {
					// console.log(e, variable);
				}

				if (ret instanceof Color) {
					colors[variable] = ret;
				}
			}
		}

		let changedColors = {};

		// Have any colors changed?
		for (let variable in colors) {
			let previous = colors[variable];

			if (previous instanceof Color) {
				let current = colors[variable] = eval(code + ";" + variable);

				if (current instanceof Color && !previous.equals(current)) {
					changedColors[variable] = current;
				}
			}

		}

		let result = serialize(ret, changedColors);

		if (result) {
			results.append(result);
		}
	}

}

function serialize(ret, changedColors) {
	var color, element;

	if (ret instanceof Color) {
		color = ret;

		element = $.create({
			textContent: ret.toString({precision: 2})
		});
	}
	else if (ret instanceof Function && ret.colorRange) {
		// Range function?
		return $.create({
			className: "cn-range",
			style: {
				"--stops": Color.steps(ret, {steps: 10})
			}
		});
	}
	else if (Array.isArray(ret)) {
		let colors = ret.map(serialize);

		if (ret.length > 2) {
			// Don't print out color if too many
			colors.forEach(c => {
				c.textContent = "";
				c.title = c.dataset.title;
			});
		}

		let contents = ["["];
		colors.forEach(c => contents.push(c, ","));
		contents.pop(); // get rid of last comma
		contents.push("]");

		return $.create({
			className: "cn-array",
			contents
		});
	}
	else if (["number", "string", "undefined"].includes(typeof ret)) {
		// We don't have a color, but maybe previous color changed?
		color = Object.values(changedColors).pop();

		if (typeof ret === "number") {
			element = $.create({
				className: "cn-number",
				textContent: util.toPrecision(ret, 3) + ""
			});
		}
		else if (typeof ret === "string") {
			element = $.create({
				className: "cn-string",
				textContent: `"${ret}"`
			});
		}
	}

	if (color) {
		if (!element) {
			element = $.create({className: "void"});
		}

		element.classList.add("cn-swatch", (color.luminance() > .5? "light" : "dark"));

		let str = element.dataset.title = color.toString({inGamut: false});

		if (element.textContent !== str) {
			element.title = str;
		}

		$.set(element, {
			style: {
				"--color": color.to(outputSpace)
			},
			properties: {
				color
			}
		});
	}

	return element;
}

$$(".language-js pre, .language-javascript pre, pre.language-js, pre.language-javascript").forEach(pre => {
	$.create("div", {
		className: "cn-wrapper",
		around: pre.parentNode.closest(".prism-live") || pre,
		contents: {className: "cn-results"}
	});

	evaluate(pre);

	let observer = new MutationObserver(_ => evaluate(pre));
	observer.observe(pre, {subtree: true, childList: true});
});
