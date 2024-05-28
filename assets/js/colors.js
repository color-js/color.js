import Color from "../../dist/color.js";

let root = document.documentElement;
let root_cs = getComputedStyle(root);
let colors = {
	red: new Color(root_cs.getPropertyValue("--color-red")),
	green: new Color(root_cs.getPropertyValue("--color-green")),
	blue: new Color(root_cs.getPropertyValue("--color-blue")),
};
let supportsP3 = window.CSS && CSS.supports("color", "color(display-p3 0 1 0)");
let interpolationOptions = {steps: 5, space: "lch", outputSpace: supportsP3 ? "p3" : "hsl"};

if (!Color.DEBUGGING) {
	let redGreen = colors.red.range(colors.green, interpolationOptions);
	let greenBlue = colors.green.range(colors.blue, interpolationOptions);
	let blueRed = colors.blue.range(colors.red, interpolationOptions);

	let vars = {
		"gradient-steps": [
			...Color.steps(redGreen, interpolationOptions),
			...Color.steps(greenBlue, interpolationOptions),
			...Color.steps(blueRed, interpolationOptions),
		],
		"color-red-light": colors.red.clone().set({"lch.l": 80}),
		"color-green-light": colors.green.clone().set({"lch.l": 80}),
		"color-blue-light": colors.blue.clone().set({"lch.l": 80}),

		"color-red-lighter": colors.red.clone().set({"lch.l": 94}),
		"color-green-lighter": colors.green.clone().set({"lch.l": 95}),
		"color-blue-lighter": colors.blue.clone().set({"lch.l": 94}),

		"color-red-green": redGreen(.5),
		"color-green-blue": greenBlue(.5),
		"color-blue-red": blueRed(.5),

		"color-red-green-light": redGreen(.5).set({"lch.l": 94}),
		"color-green-blue-light": greenBlue(.5).set({"lch.l": 94}),
		"color-blue-red-light": blueRed(.5).set({"lch.l": 94}),
	};

	window.vars = vars;

	document.head.insertAdjacentHTML("beforeend",
		`<style>
			:root {
				${Object.entries(vars).map(pair => `--${pair[0]}: ${pair[1]}`).join(";")};
			}
		</style>`);
}
