import Color from "colorjs.io/src/color";
import sRGB from "colorjs.io/src/spaces/srgb";
import set from "colorjs.io/src/set";

// @ts-expect-error
set();
// @ts-expect-error
set("red");

set("red", "foo", 123); // $ExpectType PlainColorObject
set(new Color("red"), ["srgb", "bar"], (_: number) => 123); // $ExpectType PlainColorObject
set(new Color("red"), [sRGB, "bar"], (_: number) => 123); // $ExpectType PlainColorObject

// $ExpectType PlainColorObject
set("red", {
	foo: 123,
	bar: (_: number) => 123,
});

new Color("red").set("foo", 123); // $ExpectType Color
Color.set("red", "foo", 123); // $ExpectType Color
Color.set(new Color("red"), "foo", 123); // $ExpectType Color
