import Color from "../../color.js";

// TODO generate these
let increments = [
	+180,
	-90, +90,
	-45, +45, -135, +135,
	-22.5, +22.5, -67.5, +67.5, -112.5, +112.5, -157.5, +157.5, -202.5, +202.5, -247.5, +247.5, -292.5, +292.5, -337.5, +337.5,
];

function render() {
	let color = new Color(accent_color.value).to("oklch");
	let n = number_of_colors.value - 1;

	let increment = 360 / (n + 1);
	let progIncrement = 180;

	palette.innerHTML = palette2.innerHTML = "";

	palette.insertAdjacentHTML("beforeend", `<div class="swatch" style="--color: ${color.display()}"></div>`);
	palette2.insertAdjacentHTML("beforeend", `<div class="swatch" style="--color: ${color.display()}"></div>`);

	for (let i=0; i<n; i++) {
		let equidistant = color.clone().set("h", h => h + (i + 1) * increment).display();
		palette.insertAdjacentHTML("beforeend", `<div class="swatch" style="--color: ${equidistant}"></div>`);

		let progressive = color.clone().set("h", h => h + increments[i]).display();
		palette2.insertAdjacentHTML("beforeend", `<div class="swatch" style="--color: ${progressive}"></div>`);
	}
}

accent_color.addEventListener("input", render);
number_of_colors.addEventListener("input", render);

render();
