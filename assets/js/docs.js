import * as notebook from "../../notebook/color-notebook.js";

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
			textContent: text,
			href: "#" + h2.id
		});

		// Linkify heading
		if (!$("a", h2)) {
			h2.textContent = "";
			h2.appendChild(a.cloneNode(true));
		}

		$.create("li", {
			contents: a,
			inside: pageToc
		});
	});
}

if (location.pathname.indexOf("/spaces") > -1) {
	// FIXME race condition: data may have already rendered
	Mavo.hooks.add("render-start", function(env) {
		if (this.id !== "colorSpaces") {
			return;
		}

		for (let space of env.data.space) {
			let spaceMeta = Color.spaces[space.id];

			if (!spaceMeta) {
				continue;
			}

			space.coord = Object.entries(spaceMeta.coords).map(entry => {
				return {
					name: entry[0],
					min: entry[1][0],
					max: entry[1][1]
				};
			});

			space.whitePoint = spaceMeta.white === Color.whites.D50? "D50" : "D65";
			space.cssId = spaceMeta.cssId || spaceMeta.id;
		}
	});

	Mavo.hooks.add("getdata-end", function(env) {
		if (this.id !== "colorSpaces") {
			return;
		}

		for (let space of env.data.space) {
			delete space.coord;
			delete space.whitePoint;
		}
	});

	Mavo.all.colorSpaces.dataLoaded.then(() => {
		return Mavo.defer(500);
	}).then(() => {
		$$("pre:not([class])").forEach(pre => {
			pre.classList.add("language-javascript");
			Prism.highlightElement(pre);
			notebook.init(pre);
		});
	});

	if (Mavo.all.colorSpaces && Mavo.all.colorSpaces.root.children.space.children.length > 1) {
		// Data has already rendered, re-render
		Mavo.all.colorSpaces.render(Mavo.all.colorSpaces.getData());

	}


}
