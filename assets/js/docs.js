import Notebook from "../../notebook/color-notebook.js";

let $ = Bliss;
let $$ = $.$;

// Wrap toc links in a list
let ul = $("#toc > ul");
let current = $$("#toc > ul > li > a").find(a => {
	return a.pathname.replace(/\.html|$/i, "") === location.pathname.replace(/\.html|$/i, "");
});

if (current) {
	current = current.parentNode; // <li>
	current.classList.add("current");
	current.setAttribute("aria-label", "This page");

	let pageToc = document.createElement("ul");

	makePageToc(pageToc);

	current.append(pageToc);

	document.addEventListener("mv-load", evt => {
		makePageToc(pageToc);
	});

	// Find next and previous
	let previous = current.previousElementSibling;

	if (previous) {
		previous.classList.add("previous");
		previous.setAttribute("aria-label", "Previous");
	}

	let next = current.nextElementSibling;

	if (next) {
		next.classList.add("next");
		next.setAttribute("aria-label", "Next");
	}
}

function idify(str) {
	// from Mavo.Functions.idify()
	return str
			.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Convert accented letters to ASCII
			.replace(/[^\w\s-]/g, "") // Remove remaining non-ASCII characters
			.trim().replace(/\s+/g, "-") // Convert whitespace to hyphens
			.toLowerCase();
}

function makePageToc(pageToc) {
	pageToc.textContent = "";

	// Make toc for current page
	$$("main h2:not(.no-toc)").map(h2 => {
		let text = h2.textContent;

		if (!h2.id) {
			h2.id = idify(text);
		}

		let a = $.create("a", {
			href: "#" + h2.id
		});

		// Linkify heading
		if (!$("a", h2)) {
			a.append(...h2.childNodes);
			h2.append(a);
		}
		else {
			a.textContent = h2.textContent;
		}

		let toc_a = a.cloneNode(true);
		$$(".toc-ignore", toc_a).forEach(el => el.remove());

		$.create("li", {
			contents: toc_a,
			inside: pageToc
		});
	});
}

if (location.pathname.indexOf("/spaces") > -1) {
	await Mavo.all.colorSpaceData.dataLoaded;

	let docsSpaces = Object.fromEntries(Mavo.all.colorSpaceData.root.data.space.map(space => [space.id, space]));

	let spaces = Object.entries(Color.Space.registry).map(([id, space]) => {
		let docsSpace = docsSpaces[id];

		return Object.assign(docsSpace || {
			description: "",
			url: "",
		}, {
			id,
			isAlias: space.id != id,
			aliasOf: space.id,
			aliasOfName: Color.Space.registry[space.id].name,
			base: space.base?.id,
			baseName: space.base?.name,
			name: space.name,
			coord: Object.entries(space.coords).map(([id, meta]) => {
				let range = meta.range || meta.refRange;
				return {
					id,
					name: meta.name,
					min: range?.[0],
					max: range?.[1]
				};
			}),
			whitePoint: Object.entries(Color.WHITES).find(([name, white]) => white === space.white)?.[0],
			cssId: space.cssId || space.id,
		});
	});

	Mavo.all.colorSpaces.load({
		data: {space: spaces}
	});

	Mavo.hooks.add("getdata-end", function(env) {
		if (this.id !== "colorSpaces") {
			return;
		}

		// Do not try to store things we are getting on runtime from ColorSpace.registry
		for (let space of env.data.space) {
			delete space.coord;
			delete space.whitePoint;
		}
	});

	Mavo.all.colorSpaces.dataLoaded.then(() => {
		return Mavo.defer(500);
	}).then(() => {
		$$("pre:not([class])").forEach(pre => {
			// Add class now to avoid race conditions where Prism highlights before expressions resolve
			pre.classList.add("language-javascript");
			Prism.highlightElement(pre);

			Notebook.create(pre);
		});
	});

	// if (Mavo.all.colorSpaces && Mavo.all.colorSpaces.root.children.space.children.length > 1) {
	// 	// Data has already rendered, re-render
	// 	Mavo.all.colorSpaces.render(Mavo.all.colorSpaces.getData());

	// }
}