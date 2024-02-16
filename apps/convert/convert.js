const favicon = document.querySelector('link[rel="shortcut icon"]');
const supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");

function getURLParams () {
	return Object.fromEntries(new URL(location).searchParams);
}

function update () {
	try {
		var color = new Color(colorInput.value);
		colorInput.setCustomValidity("");

		let oldParams = getURLParams();
		let newParams = [
			["color", colorInput.value],
			["precision", precisionInput.value || "0"],
		];

		let changed = ![...new URL(location).searchParams].every((pair, i) => {
			let [key, value] = pair;
			let [newKey, newValue] = newParams[i];

			return newValue && newValue.indexOf(value) === 0;
		});

		let title = newParams[0][1] + " convert";
		let query = newParams.map(pair => `${pair[0]}=${encodeURIComponent(pair[1])}`).join("&");
		history[(changed ? "push" : "replace") + "State"](null, title, "?" + query);
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
				favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><rect width="100%" fill="${converted}" /></svg>`;
			}

			let precision = precisionInput.value;
			let inGamut = converted.inGamut();
			let str = converted.toString({precision, inGamut: false});
			let str_mapped = converted.toString({precision, inGamut: true});
			let permalink = `?color=${encodeURIComponent(str)}&precision=${encodeURIComponent(precision)}`;
			let permalink_mapped = `?color=${encodeURIComponent(str_mapped)}&precision=${encodeURIComponent(precision)}`;

			ret += `<tr id="space-${ space.id }" data-id="${ space.id }">
				<td><label class="pin" title="Pin / Unpin to top"><input type=checkbox name="pin" value="${ space.id }">📌</label></td>
				<th>${space.name}</th>
				<td>${converted.coords.join(", ")}</td>
				<td>
					<div class="serialization ${inGamut || str === str_mapped ? "in-gamut" : "out-of-gamut"} ${!inGamut && str === str_mapped ? "gamut-mapped" : ""}">
						<a href="${permalink}" ${!inGamut ? 'title="Out of gamut"' : ""}>${str}</a>
						<button class="copy" data-clipboard-text="${str}" title="Copy">📋</button>
					</div>
					${str !== str_mapped ? `
					<div class="serialization gamut-mapped">
						<a href="${permalink_mapped}">${str_mapped}</a>
						<button class="copy" data-clipboard-text="${str_mapped}" title="Copy">📋</button>
					</div>` : ""}
				</td>
			</tr>`;
		}

		output.tBodies[0].innerHTML = ret;
		updatePinned();
	}
}

let urlParams = getURLParams();

colorInput.addEventListener("input", update);
precisionInput.addEventListener("input", update);

function updateFromURL () {
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
	let control;
	if (control = evt.target.closest(".copy")) {
		try {
			await navigator.clipboard.writeText(control.dataset.clipboardText);
			control.textContent = "✅";
			await wait(1000);
			control.textContent = "📋";
		}
		catch (e) {
			alert("Failed to copy to clipboard");
		}
	}
	else if (evt.target.matches("label.pin")) {
		evt.stopImmediatePropagation();
		let row = evt.target.closest("tr");
		let id = row.dataset.id;
		let pinned = getPinned();
		let isPinned = pinned.includes(id);

		if (isPinned) {
			pinned = pinned.filter(p => p !== id);
		}
		else {
			pinned.push(id);
		}
		localStorage.spaces_pinned = pinned.join(", ");
		requestAnimationFrame(() => updatePinned(pinned));
	}
});

function updatePinned (pinned) {
	pinned ??= getPinned();
	let pinnedSet = new Set(pinned);
	document.getElementsByName("pin").forEach(input => input.checked = pinnedSet.has(input.value));
	pinned_css.textContent = pinned.map((id, i) => `#space-${id} { order: -${i}; }`).join("\n");
}

function getPinned () {
	return (localStorage.spaces_pinned ?? "srgb, hsl, p3, oklch, oklch, lch, lab").split(", ");
}

import("https://incrementable.verou.me/incrementable.mjs").then(module => {
	let Incrementable = module.default;

	new Incrementable(colorInput);
});
