import Color from "colorjs.io/src";
import to from "colorjs.io/src/to";

// @ts-expect-error
to();

// @ts-expect-error
to("red");

to("red", "srgb"); // $ExpectType PlainColorObject
to("red", "srgb", { inGamut: false }); // $ExpectType PlainColorObject
to("red", "srgb", { inGamut: {method: "clip"} }); // $ExpectType PlainColorObject

new Color("red").to("srgb"); // $ExpectType Color
Color.to("red", "srgb"); // $ExpectType Color
Color.to(new Color("red"), "srgb"); // $ExpectType Color
