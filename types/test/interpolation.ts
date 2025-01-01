import Color from "colorjs.io/src";
import { sRGB, sRGB_Linear } from "colorjs.io/src/index-fn";
import { isRange, range, mix, steps, register } from "colorjs.io/src/interpolation";

isRange("foo"); // $ExpectType boolean

// @ts-expect-error
range();
// @ts-expect-error
range("red");

const r = range("red", "blue"); // $ExpectType Range
range("red", "blue", {}); // $ExpectType Range
range(r); // $ExpectType Range
range(r, {}); // $ExpectType Range
range("red", "blue", { space: "srgb", outputSpace: "srgb_linear" }); // $ExpectType Range
range("red", "blue", { space: sRGB, outputSpace: "srgb" }); // $ExpectType Range
range("red", "blue", { space: "srgb", outputSpace: sRGB_Linear }); // $ExpectType Range
// $ExpectType Range
range("red", "blue", {
	space: "srgb",
	outputSpace: "srgb_linear",
	progression: (_: number) => 1,
	premultiplied: false,
	hue: "raw",
});

// @ts-expect-error
mix();
// @ts-expect-error
mix("red");

mix("red", "blue"); // $ExpectType PlainColorObject
mix("red", "blue", 0.5); // $ExpectType PlainColorObject
mix("red", "blue", {}); // $ExpectType PlainColorObject
mix("red", "blue", 0.5, {}); // $ExpectType PlainColorObject
// $ExpectType PlainColorObject
mix("red", "blue", {
	space: "hsl",
	outputSpace: "srgb_linear",
	premultiplied: true,
	hue: "shorter",
});

// Test mix on Color class
Color.mix("red", "blue"); // $ExpectType Color
Color.mix("red", "blue", 123); // $ExpectType Color
Color.mix("red", "blue", { space: "srgb" }); // $ExpectType Color
Color.mix("red", "blue", 123, { space: "srgb" }); // $ExpectType Color
new Color("red").mix("blue"); // $ExpectType Color
new Color("red").mix("blue", 123); // $ExpectType Color
new Color("red").mix("blue", { space: "srgb" }); // $ExpectType Color
new Color("red").mix("blue", 123, { space: "hsl", hue: "shorter" }); // $ExpectType Color

steps("red", "blue"); // $ExpectType PlainColorObject[]
// $ExpectType PlainColorObject[]
steps("red", "blue", {
	maxDeltaE: 1,
	deltaEMethod: "2000",
	steps: 10,
	maxSteps: 100,
});
steps(r); // $ExpectType PlainColorObject[]
// $ExpectType PlainColorObject[]
steps(r, {
	maxDeltaE: 1,
	deltaEMethod: "2000",
	steps: 10,
	maxSteps: 100,
});

// Test steps on Color class
Color.steps(Color.range("red", "blue")); // $ExpectType Color[]
Color.steps("red", "blue"); // $ExpectType Color[]
new Color("red").steps("blue"); // $ExpectType Color[]

// @ts-expect-error
steps(r, "blue"); // $ExpectType PlainColorObject[]

// @ts-expect-error
register();
// @ts-expect-error
register(new Color("red"));

register(Color);
