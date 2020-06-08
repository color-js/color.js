import * as notebook from "./color-notebook.js";
import extensions from "../assets/js/showdown-extensions.mjs";

let container = $("[property=content]");

document.addEventListener("mv-markdown-render", function(evt) {
	container.dirty = false;

	requestAnimationFrame(() => {
		notebook.initAll(evt.target);
	});
});



container.addEventListener("input", evt => container.dirty = true);

let editObserver = new Mavo.Observer(container, "mv-mode", () => {
	if (container.getAttribute("mv-mode") === "edit" && container.dirty) {
		// Update code snippets with actual contents
		let node = Mavo.Node.get(container);
		console.log($$("textarea", container));

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
