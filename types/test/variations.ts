import Color from "colorjs.io/src/color";
import { lighten, darken } from "colorjs.io/src/variations";

// @ts-expect-error
lighten();

lighten("red"); // $ExpectType PlainColorObject
lighten(new Color("red")); // $ExpectType PlainColorObject
lighten("red", 25); // $ExpectType PlainColorObject

// @ts-expect-error
darken();

darken("red"); // $ExpectType PlainColorObject
darken(new Color("red")); // $ExpectType PlainColorObject
darken("red", 25); // $ExpectType PlainColorObject

new Color("red").lighten(); // $ExpectType Color
new Color("red").lighten(0.5); // $ExpectType Color
new Color("red").darken(); // $ExpectType Color
new Color("red").darken(0.5); // $ExpectType Color

Color.lighten("red"); // $ExpectType Color
Color.lighten("red", 0.5); // $ExpectType Color
Color.darken("red"); // $ExpectType Color
Color.darken("red", 0.5); // $ExpectType Color
