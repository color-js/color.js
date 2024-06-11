import Color from "colorjs.io/src/color";
import getAll from "colorjs.io/src/getAll";
import sRGB from "colorjs.io/src/spaces/srgb";

// @ts-expect-error
getAll();

getAll(new Color("red")); // $ExpectType Coords
getAll(new Color("red"), {space: "srgb"}); // $ExpectType Coords
getAll(new Color("red"), {space: "srgb", precision: 1}); // $ExpectType Coords
getAll(new Color("red"), {space: sRGB}); // $ExpectType Coords
getAll(new Color("red"), {space: sRGB, precision: 1}); // $ExpectType Coords
getAll(new Color("red"), {precision: 1}); // $ExpectType Coords
getAll("red", {space: sRGB}); // $ExpectType Coords
getAll("red", {space: sRGB, precision: 1}); // $ExpectType Coords
getAll("red", {precision: 1}); // $ExpectType Coords

new Color("red").getAll(); // $ExpectType Coords
new Color("red").getAll({space: "srgb"}); // $ExpectType Coords
new Color("red").getAll({space: "srgb", precision: 1}); // $ExpectType Coords
new Color("red").getAll({precision: 1}); // $ExpectType Coords
