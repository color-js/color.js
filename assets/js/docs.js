let $ = Bliss;
let $$ = $.$;

// Wrap toc links in a list
let ul = $("#toc > ul");
let current = $$("#toc > ul > li > a").find(a => a.pathname === location.pathname);

if (current) {
	current = current.parentNode; // <li>
	current.classList.add("current");
	current.setAttribute("aria-label", "This page");

	let pageToc = document.createElement("ul");

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

	current.append(pageToc);

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
	return str(readable)
			.normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Convert accented letters to ASCII
			.replace(/[^\w\s-]/g, "") // Remove remaining non-ASCII characters
			.trim().replace(/\s+/g, "-") // Convert whitespace to hyphens
			.toLowerCase();
}
