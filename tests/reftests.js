import RefTest from "https://htest.dev/src/html/reftest.js";

RefTest.hooks.add("reftest-testrow", function (env) {
	let table = this.table;

	if (!table.dataset.colors) {
		return;
	}

	let colorCols = new Set(table.dataset.colors.split(/\s*,\s*/).map(i => i - 1));

	for (let i = 0; i < env.cells.length; i++) {
		if (!colorCols.has(i)) {
			continue;
		}

		let cell = env.cells[i];
		let color;

		try {
			color = new Color(cell.textContent);
		}
		catch (e) {
			return;
		}

		cell.style.setProperty("--color", color.display());
		cell.classList.add(color.luminance > .5 || color.alpha < .5? "light" : "dark");
	}
});

// Get data from old tests and convert them to new tests
function getTests(table) {
	table = table.closest("table");
	return [...table.querySelectorAll("tbody tr")].map(tr => {
		let tds = [...tr.cells].map(td => td.textContent.trim());
		return `{
	${ tr.title? `name: "${tr.title}",
	` : "" }args: "${ tds[0] }",
	expect: [${ tds[2] ?? tds[1] }]
}`;
	}).join(",\n");
}