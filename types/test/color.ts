import Color, { Coords } from "colorjs.io/src/color";
import sRGB from "colorjs.io/src/spaces/srgb";

// @ts-expect-error
new Color();

new Color("red");
new Color(new Color("red"));
new Color("srgb", [1, 2, 3]);
new Color("srgb", [1, 2, 3], 1);

new Color({ space: sRGB, coords: [1, 1, 1], alpha: null });
new Color({ spaceId: "srgb", coords: [1, 2, 3], alpha: null });
new Color("srgb", [1, 2, 3], null);

Color.get("srgb", [1, 2, 3], null);

const color = new Color("red");
color.alpha; // $ExpectType number
color.coords; // $ExpectType Coords
color.space; // $ExpectType ColorSpace
color.spaceId; // $ExpectType string

color.clone(); // $ExpectType Color

color.display();
color.display({ space: "srgb" });

const coords: Coords = [1, 2, null];

// Most other color methods are those defined in other files, so they aren't tested here
