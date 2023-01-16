import Color from "colorjs.io/src/color";
import { getLuminance, setLuminance, register } from "colorjs.io/src/luminance";

// @ts-expect-error
getLuminance();
// @ts-expect-error
getLuminance("red");

getLuminance(new Color("red")); // $ExpectType number

// @ts-expect-error
setLuminance();
// @ts-expect-error
setLuminance("red");

// @ts-expect-error
setLuminance(new Color("red"));
setLuminance(new Color("red"), 1);
setLuminance(new Color("red"), () => 1);

// @ts-expect-error
register();
// @ts-expect-error
register(new Color("red"));

register(Color);
