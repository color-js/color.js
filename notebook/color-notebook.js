/**
* Color notebook: Interactive color examples
* Idea credit: chroma.js
* Author: Lea Verou
*/

export let $ = Bliss, $$ = $.$;
import Color, {util} from "../color.js";
import * as acorn from "https://cdn.jsdelivr.net/npm/acorn/dist/acorn.mjs";
import * as acornWalk from "https://cdn.jsdelivr.net/npm/acorn-walk/dist/walk.mjs";
import {generate} from "https://cdn.jsdelivr.net/npm/astring@1.7.4/dist/astring.mjs";

const supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
const outputSpace = supportsP3 ? "p3" : "srgb";
const codes = new WeakMap();

const acornOptions = {ecmaVersion: "2020", sourceType: "module"};

Prism.hooks.add("before-sanity-check", env => {
	if ($(".token", env.element)) {
		// Already highlighted, abort
		env.code = "";
	}
});

let evalDebounce;
Prism.hooks.add("complete", env => {
	let pre = env.element.closest("pre");

	if (pre?.notebook?.initialized) {
		clearTimeout(evalDebounce);
		evalDebounce = setTimeout(_ => pre.notebook.eval(), 500);
	}
});

export default class Notebook {
	constructor (pre) {
		this.pre = pre;
		this.pre.notebook = this;
		this.initialCode = this.pre.textContent;
		this.debug = this.pre.matches(".cn-debug, .cn-debug *");

		Notebook.all.add(this);

		Notebook.intersectionObserver.observe(this.pre);
	}

	get edited () {
		return this.initialCode !== this.code;
	}

	init () {
		if (this.initialized) {
			return false;
		}

		this.wrapper = $.create("div", {
			className: "cn-wrapper",
			around: this.pre,
			contents: {className: "cn-results"},
		});

		// Create Prism Live instance if not already present
		if (typeof Prism !== "undefined" && Prism.Live && !this.pre.live) {
			this.pre.live = new Prism.Live(this.pre);
		}

		let scriptURL = new URL("../color.js", import.meta.url);

		this.sandbox = $.create("iframe", {
			srcdoc: `<script type=module>
			import Color from "${scriptURL}";

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
			hidden: true,
		});

		this.initialized = true;

		Notebook.intersectionObserver.unobserve(this.pre);

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

	static rewrite (code) {
		let ast = acorn.parse(code, acornOptions);
		let env = new Set();
		let details = {};
		let nodes = [];

		acornWalk.fullAncestor(ast, (node, ancestors) => {
			let parent = ancestors[ancestors.length - 2];

			if (node.type === "VariableDeclaration") {
				nodes.push(node);

				for (let declaration of node.declarations) {
					let name = declaration.id.name;
					details[name] = [];
				}
			}
			else if (node.type === "Identifier") {
				if (parent.type !== "VariableDeclarator" && node.name in details) {
					nodes.push(node);
				}
			}
		});

		nodes = nodes.sort((n1, n2) => {
			return n1.start - n2.start;
		});

		let offset = 0;

		for (let node of nodes) {
			if (node.type === "VariableDeclaration") {
				// Remove let, var etc keywords since we are adding everything as properties on env
				let start = node.start + offset;
				code = code.slice(0, start) + code.slice(start + node.kind.length);
				offset -= node.kind.length;

				for (let declaration of node.declarations) {
					// Prepend variable name with env.
					let start = declaration.start + offset;
					code = code.slice(0, start) + "env." + code.substring(start);
					offset += 4;

					details[declaration.id.name].push(getNodePosition(node, code, ast));
				}
			}
			else {
				// Insert "env." at node.start + offset
				let start = node.start + offset;
				code = code.slice(0, start) + "env." + code.slice(start);
				offset += 4;

				details[node.name].push(getNodePosition(node, code, ast));
			}
		}

		return {code, details, ast};
	}

	async eval () {
		let pre = this.pre;

		if ($(".cn-evaluated.token", pre)) {
			// Already evaluated
			return;
		}

		this.code = this.pre.textContent;

		let value = this.code.trim().replace(/\s+$/m, "");
		let error;

		if (codes.get(pre) === value) {
			// We've already evaluated this
			return;
		}

		codes.set(pre, value);

		try {
			var {code, details, ast} = Notebook.rewrite(this.code);
		}
		catch (e) {
			// Syntax error
			error = e;
		}

		if (!error) {
			try {
				var statements = acorn.parse(code, acornOptions).body;
			}
			catch (e) {
				// Syntax error in the rewritten code
				error = e;
			}
		}

		let win = this.sandbox.contentWindow;
		let env = {};

		let wrapper = pre.closest(".cn-wrapper");
		let results = $(".cn-results", wrapper);

		// CLear previous results
		results.textContent = "";

		if (error) {
			// console.log(error, serialize(error, undefined, win));
			// Syntax error
			results.append(serialize(error, undefined, win));
			return;
		}

		if (!win.runLine) {
			// iframe hasn't loaded yet
			await $.when(win, "load");
		}

		for (let i = 0; i < statements.length; i++) {
			let statement = statements[i];
			let originalStatement = ast.body[i];
			let lineCode = generate(statement);
			let ret;

			try {
				ret = win.runLine(lineCode, env);
			}
			catch (e) {
				ret = e;

				if (this.debug) {
					console.warn(e, line, env, this.pre);
				}
			}

			if (ret instanceof win.Error) {
				console.log(
					"Error during statement evaluation:", ret,
					"Statement was:", lineCode,
				);
			}
			else {
				// Find which variables are included in the current statement
				acornWalk.full(originalStatement, node => {
					if (node.type !== "Identifier" || !(node.name in details)) {
						return;
					}

					let {name, start, end} = node;

					// Wrap variable
					let text = getNodeAt((start + end) / 2, pre);
					let value = env[name];

					if (value && typeof value === "object" && ("coords" in value)) {

						let offset = text.textContent.indexOf(name);

						if (offset > 0) {
							// Possible whitespace before
							text.splitText(offset);
							text = text.nextSibling;
						}

						if (text.textContent.length > name.length) {
							// Possible whitespace after
							text.splitText(name.length);
						}

						let wrappedNode = $.create("span", {
							className: "variable",
							"data-varname": name,
							"data-line": i,
							around: text,
						});

						try {
							wrappedNode.style.setProperty("--color", value.to(outputSpace));
							wrappedNode.classList.add(lightOrDark(value));
						}
						catch (e) {}
					}
					// TODO do something nice with other types :)
				});
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

				// What line is start on?
				let end = originalStatement.end;
				let nodeAtOffset = getNodeAt(end, pre, {type: "element"});

				let offset = nodeAtOffset.offsetTop - result.offsetTop
				// Prevent overly tall results (e.g. long arrays of colors)
				// to make the entire code area super tall
					- Math.max(0, result.offsetHeight - 30);

				if (offset > 5) {
					result.style.marginTop = offset + "px";
				}
			}
		}

		if (!this.sandbox.matches(".ready:not(.dirty)")) {
			await this.reloadSandbox();
		}

		this.sandbox.classList.add("dirty");

		// Add a class to the first token to mark that we've evaluated this
		// so that we don't do it again unless the contents are overwritten
		let firstToken = $("code .token", pre);

		if (firstToken) {
			firstToken.classList.add("cn-evaluated");
		}

		// Clean up after ourselves
		await this.reloadSandbox();
	}

	destroy () {
		this.sandbox.remove();
		Notebook.intersectionObserver.disconnect(this.pre);
		this.wrapper = this.sandbox = this.pre = null;
		Notebook.all.delete(this);
	}

	static create (pre) {
		if (pre.notebook) {
			return pre.notebook;
		}

		return new Notebook(pre);
	}
}

export function walk (pre, callback, filter) {
	let walker = document.createTreeWalker(pre, filter);
	let node;

	// eslint-disable-next-line no-cond-assign
	while (node = walker.nextNode()) {
		let ret = callback(node);

		if (ret !== undefined) {
			return ret;
		}
	}
}

function getNodePosition (node, code, ast) {
	let {start, end} = node;
	let before = code.slice(0, start);
	let line = before.split(/\r?\n/);
	return {start, end, line};
}

function getNodeAt (offset, container, {type} = {}) {
	let node, sum = 0;
	let walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

	// eslint-disable-next-line no-cond-assign
	while (node = walk.nextNode()) {
		sum += node.data.length;

		if (sum >= offset) {
			if (type === "element" && node.nodeType === 3) {
				node = node.parentNode;
			}

			return node;
		}
	}

	// if here, offset is larger than maximum
	return null;
}

export function serialize (ret, color, win = window) {
	let element;
	let Color = win.Color;

	if (ret === undefined) {
		return;
	}

	let flag = false;

	if (
		ret instanceof win.Error // runtime error, thrown in the sandbox
		|| ret instanceof Error  // syntax error, thrown here
	) {
		if (ret.message.indexOf("Cannot use import statement") > -1) {
			return "";
		}

		return $.create({
			className: "cn-error",
			textContent: ret.name,
			title: ret + ". Click to see error in the console.",
			onclick: _ => console.error(ret),
		});
	}

	let template = {
		title: "Click to see value in the console",
		events: {
			click: _ => console.log(ret),
		},
	};

	if (ret instanceof Color) {
		color = ret;

		element = $.create({
			...template,
			textContent: ret.toString({precision: 3, inGamut: false}),
		});

		flag = true;
	}
	else if (typeof ret === "function" && ret.rangeArgs) {
		// Range function?
		return $.create({
			...template,
			className: "cn-value cn-range",
			style: {
				"--stops": Color.steps(ret, {steps: 5, maxDeltaE: 4}).map(color => {
					if (!CSS.supports("color", color)) {
						return color.to(outputSpace);
					}

					return color;
				}),
			},
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
			...template,
			className: "cn-value cn-array",
			contents,
		});
	}
	else if (typeof ret === "number") {
		element = $.create({
			...template,
			className: "cn-number",
			textContent: util.toPrecision(ret, 3) + "",
		});
	}
	else if (typeof ret === "boolean") {
		element = $.create({
			...template,
			className: "cn-boolean",
			textContent: ret,
		});
	}
	else if (util.isString(ret)) {
		element = $.create({
			...template,
			className: "cn-string",
			textContent: `"${ret}"`,
		});
	}
	else if (ret && typeof ret === "object") {
		let keys = Object.keys(ret);
		element = $.create({
			...template,
			className: "cn-object",
			textContent: `Object {${keys.slice(0, 3).join(", ") + (keys.length > 3 ? ", ..." : "")}}`,
		});
	}

	element.classList.add("cn-value");

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
			outOfGamut.push(Color.Space.get(outputSpace).name);
		}

		if (outOfGamut.length > 0) {
			element.classList.add("out-of-gamut");
			element.title = outOfGamut.map(s => `out of ${s} gamut`).join(", ");
		}

		$.set(element, {
			style: {
				"--color": color.to(outputSpace),
			},
			properties: {
				color,
			},
		});
	}

	return element;
}

function lightOrDark (color) {
	return color.luminance > .5 || color.alpha < .5 ? "light" : "dark";
}

Notebook.all = new Set();

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

export function initAll (container = document) {
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

// // for debugging
// self.acorn = acorn;
// self.acornWalk = acornWalk;
