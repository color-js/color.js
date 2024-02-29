import Color from "colorjs.io/src/color";
import setAll from "colorjs.io/src/setAll";
import sRGB from "colorjs.io/src/spaces/srgb";

// @ts-expect-error
setAll();
// @ts-expect-error
setAll("red");
// @ts-expect-error
setAll(new Color("red"), "srgb");
// @ts-expect-error
setAll(new Color("red"), sRGB);

setAll(new Color("red"), "srgb", [1, 2, 3]); // $ExpectType PlainColorObject
setAll(new Color("red"), sRGB, [1, 2, 3]); // $ExpectType PlainColorObject
// $ExpectType PlainColorObject
setAll(
	{
		coords: [1, 2, 3],
		space: sRGB,
		alpha: 1,
	},
	"srgb_linear",
	[4, 5, 6],
);

new Color("red").setAll("srgb", [1, 2, 3]); // $ExpectType Color
new Color("red").setAll(sRGB, [1, 2, 3]); // $ExpectType Color
Color.setAll("red", "srgb", [1, 2, 3]); // $ExpectType Color
Color.setAll(new Color("red"), "srgb", [1, 2, 3]); // $ExpectType Color
