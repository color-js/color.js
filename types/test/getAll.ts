import Color from "colorjs.io/src/color";
import getAll from "colorjs.io/src/getAll";
import sRGB from "colorjs.io/src/spaces/srgb";

// @ts-expect-error
getAll();

getAll(new Color("red")); // $ExpectType Coords
getAll(new Color("red"), "srgb"); // $ExpectType Coords
getAll(new Color("red"), sRGB); // $ExpectType Coords
getAll(new Color("red"), sRGB, 1); // $ExpectType Coords
getAll("red", sRGB); // $ExpectType Coords
getAll("red", sRGB, 1); // $ExpectType Coords
getAll("red", 2); // $ExpectType Coords

new Color("red").getAll(); // $ExpectType Coords
new Color("red").getAll(2); // $ExpectType Coords
new Color("red").getAll("oklch", 1); // $ExpectType Coords
