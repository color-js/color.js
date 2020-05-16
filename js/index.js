let $ = Bliss;
let $$ = $.$;


import {} from "./color-notebook.js";

let root = document.documentElement;
let cs = getComputedStyle(root);
let colors = {
	red: new Color(cs.getPropertyValue("--color-red")),
	green: new Color(cs.getPropertyValue("--color-green")),
	blue: new Color(cs.getPropertyValue("--color-blue"))
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
	"color-red-light": colors.red.lighten(),
	"color-green-light": colors.green.lighten(),
	"color-blue-light": colors.blue.lighten(),

	"color-red-green": redGreen(.5),
	"color-green-blue": greenBlue(.5),
	"color-blue-red": blueRed(.5),
};

$.create("style", {
	inside: document.head,
	textContent: `:root {${Object.entries(vars).map(pair => `--${pair[0]}: ${pair[1]}`).join(";\n")}}`
});
