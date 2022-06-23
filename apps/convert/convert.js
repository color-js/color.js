const favicon = document.querySelector('link[rel="shortcut icon"]');
const supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");

function getURLParams() {
	return Object.fromEntries(new URL(location).searchParams);
}

function update() {
	try {
		var color = new Color(colorInput.value);
		colorInput.setCustomValidity("");

		let oldParams = getURLParams();
		let newParams = [
			["color", colorInput.value],
			["precision", precisionInput.value || "0"]
		];

		let changed = ![...new URL(location).searchParams].every((pair, i) => {
			let [key, value] = pair;
			let [newKey, newValue] = newParams[i];

			return newValue && newValue.indexOf(value) === 0;
		});

		let title = newParams[0][1] + " convert";
		let query = newParams.map(pair => `${pair[0]}=${encodeURIComponent(pair[1])}`).join("&");
		history[(changed? "push" : "replace") + "State"](null, title, "?" + query);
		document.title = title;
	}
	catch (e) {
		if (e.message.indexOf("Cannot parse") > -1) {
			colorInput.setCustomValidity(e);
			colorOutput.style.background = "var(--error-background)";
			return;
		}
		else {
			throw e;
		}
	}

	if (color) {
		output.tBodies[0].textContent = "";
		let ret = "";

		// Prevent aliases showing up in the output
		let spaces = new Set(Color.Space.all);

		for (let space of spaces) {
			let id = space.id;
			let converted = color.to(id);

			if (id === "srgb" || (id === "p3") && supportsP3) {
				colorOutput.style.background = converted;
				favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" fill="${converted}" /></svg>`
			}

			let precision = precisionInput.value;
			let inGamut = converted.inGamut();
			let str = converted.toString({precision, inGamut: false});
			let str_mapped = converted.toString({precision, inGamut: true});
			let permalink = `?color=${encodeURIComponent(str)}&precision=${encodeURIComponent(precision)}`;
			let permalink_mapped = `?color=${encodeURIComponent(str_mapped)}&precision=${encodeURIComponent(precision)}`;

			ret += `<tr>
				<th>${space.name}</th>
				<td>${converted.coords.join(", ")}</td>
				<td>
					<div class="serialization ${inGamut || str === str_mapped? "in-gamut" : "out-of-gamut"} ${!inGamut && str === str_mapped? "gamut-mapped" : ""}">
						<a href="${permalink}" ${!inGamut? 'title="Out of gamut"' : ""}>${str}</a>
						<button class="copy" data-clipboard-text="${str}" title="Copy">📋</button>
					</div>
					${str !== str_mapped? `
					<div class="serialization gamut-mapped">
						<a href="${permalink_mapped}">${str_mapped}</a>
						<button class="copy" data-clipboard-text="${str_mapped}" title="Copy">📋</button>
					</div>` : ""}
				</td>
			</tr>`;
		}

		output.tBodies[0].innerHTML = ret;
	}
};

let urlParams = getURLParams();

colorInput.addEventListener("input", update);
precisionInput.addEventListener("input", update);

function updateFromURL() {
	colorInput.value = urlParams.color || colorInput.value;
	precisionInput.value = urlParams.precision || precisionInput.value;
	update();
}

updateFromURL();

addEventListener("popstate", updateFromURL);

function wait (ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

document.body.addEventListener("click", async evt => {
	let copyButton = evt.target.closest(".copy");
	if (copyButton) {
		try {
			await navigator.clipboard.writeText(copyButton.dataset.clipboardText);
			copyButton.textContent = "✅";
			await wait(1000);
			copyButton.textContent = "📋";
		}
		catch(e) {
			alert("Failed to copy to clipboard");
		}
	}
})