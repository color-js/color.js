import Color from "colorjs.io/src/color";
// The itself doesn't export any values, so just check that it's a module
import "colorjs.io/src/space-accessors";

const color = new Color("red");

color.srgb[0] = 1;
color.srgb[1] = 1;
color.srgb[2] = 1;
color.srgb.r = 1;
color.srgb.g = 1;
color.srgb.b = 1;
