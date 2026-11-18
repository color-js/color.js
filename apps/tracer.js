import isValid from "../src/isValid.js";

// args: "lch(90 0 none)",
// args: "oklch(1 0 none)",
// args: "hsl(none, 50%, 50%)",

function main () {
	// const value = "#ff0066";
	// const value = "color(display-p3 0 1 0 / .5)";
	// const value = "oklch(100% 0 30deg)";
	const value = "rgb(10deg 10 10)";

	// const value = "lch(255 255 none / 255)";
	// const value = "rgb(255 255)";
	// const value = "blue";
	// const value = "GREEN";
	console.log(
		`Hello from Tracer, color string '${value}' is ${isValid(value) ? "VALID" : "INVALID"}`,
	);
}

main();
