/**
* Color notebook: Interactive color examples
* Idea credit: chroma.js
* Author: Lea Verou
*/

let $ = Bliss, $$ = $.$;
import Color, {util} from "../color.js";

const supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
const outputSpace = Color.space(supportsP3? "p3" : "srgb");
const codes = new WeakMap();

Prism.hooks.add("before-sanity-check", env => {
	if ($(".token", env.element)) {
		// Already highlighted, abort
		env.code = "";
	}
});

function walk(pre, callback, filter) {
	let walker = document.createTreeWalker(pre, filter);
	let node;

	while (node = walker.nextNode()) {
		let ret = callback(node);

		if (ret !== undefined) {
			return ret;
		}
	}
}

function evaluate (pre) {
	if ($(".cn-evaluated.token", pre)) {
		// Already evaluated
		return;
	}

	// Create a clone so we can take advantage of Prism's parsing to tweak the code
	// Bonus: Comment this out to debug what's going on!
	let originalPre = pre;
	pre = pre.cloneNode(true);

	// Remove comments
	$$(".comment", pre).forEach(comment => comment.remove());

	// Replace variable declarations with property creation on env
	// This is so we can evaluate line by line, because eval() in strict mode has its own scope

	let variables = new Set();
	let nextVariable;

	walk(pre, (node) => {
		let text = node.textContent.trim();
		let parent = node.parentNode;
		let inRoot = parent.matches("code");

		if (!text) {
			// Whitespace node
			return;
		}

		if (nextVariable && inRoot) {
			variables.add(text);
			nextVariable = false;
		}
		else if (parent.matches(".token.keyword") && (text === "var" || text === "let")) {
			nextVariable = true; // next token is the variable name
			node.textContent = "";
		}

		if ((inRoot || parent.matches(".token.function")) && variables.has(text)) {
			// node.textContent = "env." + text;
			node.textContent = node.textContent.replace(text, "env.$&");
		}
	}, NodeFilter.SHOW_TEXT);

	let value = pre.textContent.trim().replace(/\s+$/m, "");

	if (codes.get(pre) === value) {
		// We've already evaluated this
		return;
	}

	codes.set(pre, value);

	let varNodes = new Set();
	let semicolons = [];
	let line = 0;
	let varLines = [];

	// Wrap the variables so we can find them easily later
	walk(originalPre, (node) => {
		let text = node.textContent.trim();
		let parent = node.parentNode;
		let inRoot = parent.matches("code");

		if (inRoot && variables.has(text)) {
			// TODO get whitespace outside
			node.line = line;
			varNodes.add(node);
		}
		else if (parent.matches(".token.punctuation") && text === ";") {
			semicolons.push(parent);
			line++;
		}
	}, NodeFilter.SHOW_TEXT);

	for (let node of varNodes) {
		let wholeText = node.textContent;
		let text = wholeText.trim();
		let line = node.line;
		varLines[line] = varLines[line] || new Set();

		if (text !== wholeText) {
			// There is whitespace
			let start = wholeText.indexOf(text);
			let end = start + text.length;

			if (start > 0) {
				// Whitespace in the beginning
				node.splitText(start);
				node = node.nextSibling;
			}

			if (end < wholeText.length) {
				// Whitespace in the end
				node.splitText(text.length);
			}
		}

		let wrappedNode = $.create("span", {
			className: "variable",
			"data-varname": text,
			"data-line": line,
			textContent: node.textContent
		});

		node.replaceWith(wrappedNode);

		// Associate variable nodes with lines so we know which line is relevant
		varLines[line].add(wrappedNode);
	}

	// Split by semicolon
	let lines = value.trim().split(/\s*;\s*/);

	// Remove last line if empty
	if (!lines[lines.length - 1]) {
		lines.pop();
	}

	let env = {};
	let wrapper = originalPre.closest(".cn-wrapper");
	let results = $(".cn-results", wrapper);

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

		// Update variables in the current line
		let lineVars = varLines[i];

		if (lineVars && lineVars.size > 0) {
			for (let node of lineVars) {
				let variable = node.textContent;
				let value = env[variable];

				if (value instanceof Color) {
					node.style.setProperty("--color", value.to(outputSpace));
					node.classList.add(value.luminance() > .5? "light" : "dark");
				}
				// TODO do something nice with other types :)
			}
		}

		let result = serialize(ret);

		if (result) {
			results.append(result);

			// Make result line up with its line if there's space
			let semicolon = semicolons[i];

			if (semicolon) {

				let offset = semicolon.offsetTop - result.offsetTop
				// Prevent overly tall results (e.g. long arrays of colors)
				// to make the entire code area super tall
				             - Math.max(0, result.offsetHeight - 30);

				if (offset > 5) {
					result.style.marginTop = offset + "px";
				}
			}
		}
	}

	// Add a class to the first token to mark that we've evaluated this
	// so that we don't do it again unless the contents are overwritten
	let firstToken = $(".token", originalPre);

	if (firstToken) {
		firstToken.classList.add("cn-evaluated");
	}
}

function serialize(ret, color) {
	var color, element;

	if (ret === undefined) {
		return;
	}

	if (ret instanceof Color) {
		color = ret;

		element = $.create({
			textContent: ret.toString({precision: 2})
		});
	}
	else if (ret instanceof Function && ret.rangeArgs) {
		// Range function?
		return $.create({
			className: "cn-range",
			style: {
				"--stops": Color.steps(ret, {steps: 5, delta: 4}).map(color => {
					if (!CSS.supports("color", color)) {
						return color.to(outputSpace);
					}

					return color;
				})
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
	else if (typeof ret === "number") {
		element = $.create({
			className: "cn-number",
			textContent: util.toPrecision(ret, 3) + ""
		});
	}
	else if (typeof ret === "boolean") {
		element = $.create({
			className: "cn-boolean",
			textContent: ret
		});
	}
	else if (typeof ret === "string") {
		element = $.create({
			className: "cn-string",
			textContent: `"${ret}"`
		});
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

		element.classList.add("cn-color", color.luminance() > .5? "light" : "dark");

		let str = element.dataset.title = color.toString({inGamut: false});

		if (element.textContent !== str) {
			element.title = str;
		}

		let outOfGamut = [];

		if (!color.inGamut()) {
			outOfGamut.push(color.space.name);
		}

		if (outputSpace !== color.space && !color.inGamut({space: outputSpace})) {
			outOfGamut.push(outputSpace.name);
		}

		if (outOfGamut.length > 0) {
			element.classList.add("out-of-gamut");
			element.title += ` (out of ${outOfGamut.join(", ")} gamut)`;
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

let intersectionObserver = new IntersectionObserver(entries => {
	for (let entry of entries) {
		if (entry.intersectionRatio === 0) {
			// IntersectionObserver callback fires immediately for no reason
			// so we need to guard against this
			continue;
		}

		let pre = entry.target;

		intersectionObserver.unobserve(pre);

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


	}
});

$$(".language-js pre, .language-javascript pre, pre.language-js, pre.language-javascript").forEach(pre => {
	intersectionObserver.observe(pre);
});
