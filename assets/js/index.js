let $ = Bliss;
let $$ = $.$;

import {} from "../../notebook/color-notebook.js";

let root = document.documentElement;
let colors = {
	red: new Color("--color-red"),
	green: new Color("--color-green"),
	blue: new Color("--color-blue")
};

let supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
let interpolationOptions = {steps: 5, space: "lch", outputSpace: supportsP3? "p3" : "hsl"};
let redGreen = colors.red.range(colors.green, interpolationOptions);
let greenBlue = colors.green.range(colors.blue, interpolationOptions);
let blueRed = colors.blue.range(colors.red, interpolationOptions);

let vars = {
	"gradient-steps": [
		...Color.steps(redGreen, interpolationOptions),
		...Color.steps(greenBlue, interpolationOptions),
		...Color.steps(blueRed, interpolationOptions)
	],
	"color-red-light": colors.red.clone().set({lightness: 80}),
	"color-green-light": colors.green.clone().set({lightness: 80}),
	"color-blue-light": colors.blue.clone().set({lightness: 80}),

	"color-red-lighter": colors.red.clone().set({lightness: 94}),
	"color-green-lighter": colors.green.clone().set({lightness: 95}),
	"color-blue-lighter": colors.blue.clone().set({lightness: 94}),

	"color-red-green": redGreen(.5),
	"color-green-blue": greenBlue(.5),
	"color-blue-red": blueRed(.5),

	"color-red-green-light": redGreen(.5).set({lightness: 94}),
	"color-green-blue-light": greenBlue(.5).set({lightness: 94}),
	"color-blue-red-light": blueRed(.5).set({lightness: 94}),
};

$.create("style", {
	inside: document.head,
	textContent: `:root {
		${Object.entries(vars).map(pair => `--${pair[0]}: ${pair[1]}`).join(";\n")};
		--scrolltop: ${root.scrollTop};
	}`
});

document.addEventListener("scroll", evt => {
	root.style.setProperty("--scrolltop", root.scrollTop);
}, {passive: true});

if (location.pathname.indexOf("/docs/") > -1 && window.toc) {
	import("./docs.js");
}
