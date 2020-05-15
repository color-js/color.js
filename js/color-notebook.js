/**
* Color notebook: Interactive color examples
* Idea credit: chroma.js
* Author: Lea Verou
*/

let $ = Bliss, $$ = $.$;
import Color, {util} from "../color.js";

const supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
const outputSpace = supportsP3? "p3" : "srgb";
const codes = new WeakMap();

function evaluate (pre) {
	let wrapper = pre.closest(".cn-wrapper");
	let results = $(".cn-results", wrapper);

	// Create a clone so we can take advantage of Prism's parsing to tweak the code
	// Bonus: Comment this out to debug what's going on!
	pre = pre.cloneNode(true);

	// Remove comments
	$$(".comment").forEach(comment => comment.remove());

	// Replace variable declarations with proxperty creation on env
	// This is so we can evaluate line by line, because eval() in strict mode has its own scope
	let walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
	let variables = new Set();
	let node; // skip pre
	let nextVariable;

	while (node = walker.nextNode()) {
		let text = node.textContent.trim();
		let parent = node.parentNode;
		let inRoot = parent.matches("code");

		if (nextVariable && inRoot) {
			variables.add(text);
			nextVariable = false;
		}
		else if (parent.matches(".token.keyword") && (text === "var" || text === "let")) {
			nextVariable = true; // next token is the variable name
			node.textContent = "";
		}

		if ((inRoot || parent.matches(".token.function")) && variables.has(text)) {
			node.textContent = "env." + text;
		}
	}

	let value = pre.textContent.trim().replace(/\s+$/m, "");

	if (codes.get(pre) === value) {
		// We've already evaluated this
		return;
	}

	codes.set(pre, value);

	// Split by semicolon
	let lines = value.trim().split(/\s*;\s*/);

	// Remove last line if empty
	if (!lines[lines.length - 1]) {
		lines.pop();
	}

	let variable;
	let env = {};

	// CLear previous results
	results.textContent = "";

	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		let ret;

		try {
			ret = eval(line);
		}
		catch (e) {
			continue;
		}

		// Which variables are used in the current line?
		let lineVariables = [];

		for (let variable of variables) {
			if (line.indexOf("env." + variable) > -1) {
				lineVariables.push(variable);
			}
		}

		let color;

		if (!(ret instanceof Color)) {
			// If result is not a color, get last color variable
			color = lineVariables.reverse().find(c => env[c] instanceof Color);
		}

		let result = serialize(ret, env[color]);

		if (result) {
			results.append(result);
		}
	}
}

function serialize(ret, color) {
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
				"--stops": Color.steps(ret, {steps: 5, delta: 4})
			}
		});
	}
	else if (Array.isArray(ret)) {
		let colors = ret.map(c => serialize(c));

		if (ret.length > 2 && ret[0] instanceof Color) {
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
	else if (ret && typeof ret === "object") {
		let keys = Object.keys(ret);
		element = $.create({
			className: "cn-object",
			textContent: `Object {${keys.slice(0, 3).join(", ") + (keys.length > 3? ", ..." : "")}}`
		});
	}

	if (color instanceof Color) {
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

	let observer = new MutationObserver(_ => {
		observer.disconnect();
		evaluate(pre);
		observer.observe(pre, {subtree: true, childList: true});
	});
	observer.observe(pre, {subtree: true, childList: true});
});
