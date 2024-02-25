import Color from "colorjs.io/src/color";
import getColor from "colorjs.io/src/getColor";

// @ts-expect-error
getColor();

getColor("red"); // $ExpectType PlainColorObject
getColor(new Color("red")); // $ExpectType PlainColorObject

getColor(["red", "blue"]); // $ExpectType PlainColorObject[]

