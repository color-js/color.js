import to from "colorjs.io/src/to";

// @ts-expect-error
to();

// @ts-expect-error
to("red");

to("red", "srgb"); // $ExpectType PlainColorObject
to("red", "srgb", { inGamut: false }); // $ExpectType PlainColorObject
