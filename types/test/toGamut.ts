import Color from "colorjs.io/src";
import toGamut from "colorjs.io/src/toGamut";
import sRGB from "colorjs.io/src/spaces/srgb";

// @ts-expect-error
toGamut();

toGamut("red"); // $ExpectType PlainColorObject

toGamut(new Color("red")); // $ExpectType PlainColorObject
toGamut(new Color("red"), { method: "clip", space: "srgb" }); // $ExpectType PlainColorObject
toGamut(new Color("red"), { method: "clip", space: sRGB }); // $ExpectType PlainColorObject
toGamut(new Color("red"), "srgb"); // $ExpectType PlainColorObject


new Color("red").toGamut(); // $ExpectType Color
new Color("red").toGamut({ method: "clip", space: "srgb" }); // $ExpectType Color
new Color("red").toGamut({ method: "clip", space: sRGB }); // $ExpectType Color
new Color("red").toGamut("srgb"); // $ExpectType Color
