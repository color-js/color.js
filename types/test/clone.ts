import Color from "colorjs.io/src/color";
import clone from "colorjs.io/src/clone";
import { sRGB } from "colorjs.io/src/spaces/index-fn";

// @ts-expect-error
clone();

clone(new Color("red")); // $ExpectType ColorObject
// $ExpectType ColorObject
clone({
	space: sRGB,
	coords: [0, 0, 0],
	alpha: 1,
});
