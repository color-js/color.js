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

Prism.hooks.add("before-sanity-check", env => {
	if ($(".token", env.element)) {
		// Already highlighted, abort
		env.code = "";
	}
});


Prism.hooks.add("complete", env => {
	let pre = env.element.closest("pre");

	if (pre?.notebook?.initialized) {
		pre.notebook.eval();
	}
});

export default class Notebook {
	constructor (pre) {
		this.pre = pre;
		this.pre.notebook = this;

		Notebook.intersectionObserver.observe(this.pre);
	}

	init () {
		if (this.initialized) {
			return false;
		}

		this.wrapper = $.create("div", {
			className: "cn-wrapper",
			around: this.pre,
			contents: {className: "cn-results"}
		});

		// Create Prism Live instance if not already present
		if (typeof Prism !== "undefined" && Prism.Live && !this.pre.live) {
			this.pre.live = new Prism.Live(this.pre);
		}

		this.sandbox = $.create("iframe", {
			srcdoc: `<script type=module>
			import Color from "https://colorjs.io/color.js";

			window.runLine = function (line, env) {
				let doc = {
					documentElement: document.documentElement,
					head: document.head,
					querySelector: parent.document.querySelector.bind(parent.document),
					querySelectorAll: parent.document.querySelector.bind(parent.documentAll)
				};
				{
					let parent, window, location, self;
					let document = doc;

					return eval(line);
				}
			}
			</script>
			<style>:root {--color-red: hsl(0 80% 50%); --color-green: hsl(90 50% 45%); --color-blue: hsl(210 80% 55%)}</style>`,
			// sandbox: "allow-scripts allow-same-origin",
			inside: document.body,
			hidden: true
		});

		this.initialized = true;

		this.eval();

		return true;
	}

	async reloadSandbox () {
		if (this.sandbox.contentWindow?.document.readyState === "complete") {
			this.sandbox.classList.remove("ready", "dirty");
			this.sandbox.contentWindow.location.reload();
		}

		await new Promise(r => this.sandbox.addEventListener("load", r, {once: true}));
		let win = this.sandbox.contentWindow;

		if (win.document.readyState !== "complete") {
			await new Promise(r => win.addEventListener("load", r, {once: true}));
		}

		this.sandbox.classList.add("ready");

		return win;
	}

	async eval () {
		let pre = this.pre;

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

			if (nextVariable && (inRoot || parent.matches(".token.constant"))) {
				// Variables with ALL_CAPS are highlighted as constants
				variables.add(text);
				nextVariable = false;
			}
			else if (parent.matches(".token.keyword") && (text === "var" || text === "let")) {
				nextVariable = true; // next token is the variable name
				node.textContent = "";
			}

			if ((inRoot || parent.matches(".token.function, .token.template-string .interpolation, .token.constant")) && variables.has(text)) {
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
		if (["", "\u200b"].includes(lines[lines.length - 1])) {
			lines.pop();
		}

		if (!this.sandbox.matches(".ready:not(.dirty)")) {
			await this.reloadSandbox();
		}

		this.sandbox.classList.add("dirty");

		let win = this.sandbox.contentWindow;
		let env = {};

		let wrapper = originalPre.closest(".cn-wrapper");
		let results = $(".cn-results", wrapper);

		// CLear previous results
		results.textContent = "";

		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			let isLastLine = i === lines.length - 1;
			let ret;

			try {
				ret = win.runLine(line, env);
			}
			catch (e) {
				ret = e;
			}

			if (!(ret instanceof win.Error)) {
				// Update variables in the current line
				let lineVars = varLines[i];

				if (lineVars && lineVars.size > 0) {
					for (let node of lineVars) {
						let variable = node.textContent;
						let value = env[variable];

						if (value instanceof win.Color) {
							try {
								node.style.setProperty("--color", value.to(outputSpace));
								node.classList.add(lightOrDark(value));
							}
							catch (e) {}
						}
						// TODO do something nice with other types :)
					}
				}
			}

			let result;

			try {
				result = serialize(ret, undefined, win);
			}
			catch (e) {

			}

			if (result) {
				results.append(result);

				// Make result line up with its line if there's space
				let semicolon = semicolons[i];

				if (!semicolon && isLastLine) {
					// Last line often doesn't have a semicolon
					semicolon = originalPre.lastElementChild.lastElementChild;
				}

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
		let firstToken = $("code .token", originalPre);

		if (firstToken) {
			firstToken.classList.add("cn-evaluated");
		}

		// Clean up after ourselves
		await this.reloadSandbox();
	}

	static create (pre) {
		if (pre.notebook) {
			return pre.notebook;
		}

		return new Notebook(pre);
	}
}

export function walk(pre, callback, filter) {
	let walker = document.createTreeWalker(pre, filter);
	let node;

	while (node = walker.nextNode()) {
		let ret = callback(node);

		if (ret !== undefined) {
			return ret;
		}
	}
}

export function serialize(ret, color, win = window) {
	var color, element;
	let Color = win.Color;

	if (ret === undefined) {
		return;
	}

	if (ret instanceof win.Error) {
		return $.create({
			className: "cn-error",
			textContent: ret.name,
			title: ret + ""
		});
	}

	if (ret instanceof Color) {
		color = ret;

		element = $.create({
			textContent: ret.toString({precision: 3, inGamut: false})
		});
	}
	else if (typeof ret === "function" && ret.rangeArgs) {
		// Range function?
		return $.create({
			className: "cn-range",
			style: {
				"--stops": Color.steps(ret, {steps: 5, maxDeltaE: 4}).map(color => {
					if (!CSS.supports("color", color)) {
						return color.to(outputSpace);
					}

					return color;
				})
			}
		});
	}
	else if (Array.isArray(ret)) {
		let colors = ret.map(c => serialize(c, undefined, win));

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
	else if (util.isString(ret)) {
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

		element.classList.add("cn-color", lightOrDark(color));

		let str = element.dataset.title = color.toString({inGamut: false});

		let outOfGamut = [];

		if (!color.inGamut()) {
			outOfGamut.push(color.space.name);
		}

		if (outputSpace !== color.spaceId && !color.inGamut(outputSpace)) {
			outOfGamut.push(Color.space(outputSpace).name);
		}

		if (outOfGamut.length > 0) {
			element.classList.add("out-of-gamut");
			element.title = outOfGamut.map(s => `out of ${s} gamut`).join(", ");
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

function lightOrDark(color) {
	return color.luminance > .5 || color.alpha < .5? "light" : "dark"
}

Notebook.intersectionObserver = new IntersectionObserver(entries => {
	for (let entry of entries) {
		if (entry.intersectionRatio === 0) {
			// IntersectionObserver callback fires immediately for no reason
			// so we need to guard against this
			continue;
		}

		let pre = entry.target;

		pre?.notebook.init();
	}
});

export function initAll(container = document) {
	let pres = $$(".language-js, .language-javascript", container).flatMap(el => {
		let ret = $$("pre > code", el);
		let ancestor =  el.closest("pre > code");

		if (ancestor) {
			ret.push(ancestor);
		}

		return ret.filter(code => !code.matches(".cn-ignore, .cn-ignore *")
		                       && !code.matches('[class*="language-"]:not(.language-js):not(.language-javascript)'));
	}).map(code => code.parentNode);

	for (let pre of pres) {
		Notebook.create(pre);
	}
}

initAll();
