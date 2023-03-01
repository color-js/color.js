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
