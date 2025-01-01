import Color from "colorjs.io/src/color";
import { uv, xy, register } from "colorjs.io/src/chromaticity";

// @ts-expect-error
uv();

uv("red"); // $ExpectType [number, number]
uv(new Color("red")); // $ExpectType [number, number]
new Color("red").uv(); // $ExpectType [number, number]

// @ts-expect-error
xy();

xy("red"); // $ExpectType [number, number]
xy(new Color("red")); // $ExpectType [number, number]
new Color("red").xy(); // $ExpectType [number, number]

// @ts-expect-error
register();
// @ts-expect-error
register(new Color("red"));

register(Color);
