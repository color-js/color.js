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
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Convert accented letters to ASCII
		.replace(/[^\w\s-]/g, "") // Remove remaining non-ASCII characters
		.trim()
		.replace(/\s+/g, "-") // Convert whitespace to hyphens
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
			href: "#" + h2.id,
		});

		// Linkify heading
		if (!$("a", h2)) {
			a.append(...h2.childNodes);
			h2.append(a);
		} else {
			a.textContent = h2.textContent;
		}

		let toc_a = a.cloneNode(true);
		$$(".toc-ignore", toc_a).forEach(el => el.remove());

		$.create("li", {
			contents: toc_a,
			inside: pageToc,
		});
	});
}
