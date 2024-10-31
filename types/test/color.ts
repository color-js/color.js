import Color, { Coords } from "colorjs.io/src/color";

// @ts-expect-error
new Color();

new Color("red");
new Color(new Color("red"));
new Color("srgb", [1, 2, 3]);
new Color("srgb", [1, 2, 3], 1);

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
