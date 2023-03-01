import Color from "colorjs.io/src/color";
import { sRGB, sRGB_Linear } from "colorjs.io/src/index-fn";
import {
	isRange,
	range,
	mix,
	steps,
	register,
} from "colorjs.io/src/interpolation";

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
	space: "srgb",
	outputSpace: "srgb_linear",
	premultiplied: true,
});

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

// @ts-expect-error
steps(r, "blue"); // $ExpectType PlainColorObject[]

// @ts-expect-error
register();
// @ts-expect-error
register(new Color("red"));

register(Color);
