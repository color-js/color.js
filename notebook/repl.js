import Notebook, {initAll} from "./color-notebook.js";
import extensions from "../assets/js/showdown-extensions.mjs";

let $ = Bliss;

let container = $("[property=content]");

document.addEventListener("mv-markdown-render", function(evt) {
	container.dirty = false;

	requestAnimationFrame(() => {
		initAll(evt.target);
	});
});

function updateMarkdown() {
	// Update code snippets with actual contents
	let node = Mavo.all.colorNotebook.root.children.content;
	let value = node.value;
	// This approach will fail when a) we have duplicate code in multiple snippets
	// b) when we have empty code areas

	for (let notebook of Notebook.all) {
		if (notebook?.edited) {
			value = value.replace("```js\n" + notebook.initialCode + "\n```", "```js\n" + notebook.code + "\n```");
		}

		notebook.destroy();
	}

	if (node.value !== value
		&& confirm("You have edited the code snippets, do you want to transfer these changes to your Markdown?")) {
		node.value = value;
	}
}

Mavo.hooks.add("save-start", function() {
	if (this.id === "colorNotebook") {
		updateMarkdown();
	}
});


let editObserver = new Mavo.Observer(container, "mv-mode", () => {
	if (container.getAttribute("mv-mode") === "edit") {
		updateMarkdown();
	}
});

(async () => {

await Mavo.ready;

for (let id in extensions) {
	showdown.extension(id, () => [
		extensions[id]
	]);
}

let defaultOptions = Mavo.Plugins.loaded.markdown.defaultOptions;

defaultOptions.extensions = defaultOptions.extensions || [];
defaultOptions.extensions.push("apiLinks", "callouts");

})();
