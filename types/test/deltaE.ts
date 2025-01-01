import Color from "colorjs.io/src/color";
import deltaE from "colorjs.io/src/deltaE";
import deltaE76 from "colorjs.io/src/deltaE/deltaE76";
import deltaE2000 from "colorjs.io/src/deltaE/deltaE2000";
import deltaECMC from "colorjs.io/src/deltaE/deltaECMC";
import deltaEHCT from "colorjs.io/src/deltaE/deltaEHCT";
import deltaEITP from "colorjs.io/src/deltaE/deltaEITP";
import deltaEJz from "colorjs.io/src/deltaE/deltaEJz";
import deltaEOK from "colorjs.io/src/deltaE/deltaEOK";
import type { ColorObject } from "colorjs.io/src/color";

const c1 = new Color("red");
const c2 = new Color("blue");

const blue: ColorObject = { spaceId: "srgb", coords: [0, 0, 1] };

// @ts-expect-error
deltaE();
// @ts-expect-error
deltaE(c1);

// @ts-expect-error
deltaE(c1, c2, "abcdef");

// @ts-expect-error
deltaE(c1, c2, { method: "abcdef" });

deltaE(c1, c2, "2000"); // $ExpectType number
deltaE(c1, c2, { method: "2000" }); // $ExpectType number

deltaE76(c1, c2); // $ExpectType number
deltaE76("red", blue); // $ExpectType number

deltaE2000(c1, c2); // $ExpectType number
deltaE2000("red", blue); // $ExpectType number

deltaECMC(c1, c2); // $ExpectType number
deltaECMC("red", blue); // $ExpectType number

deltaEHCT(c1, c2); // $ExpectType number
deltaEHCT("red", blue); // $ExpectType number

deltaEITP(c1, c2); // $ExpectType number
deltaEITP("red", blue); // $ExpectType number

deltaEJz(c1, c2); // $ExpectType number
deltaEJz("red", blue); // $ExpectType number

deltaEOK(c1, c2); // $ExpectType number
deltaEOK("red", blue); // $ExpectType number

// @ts-expect-error
c1.deltaE(c2, "abcdef");

// @ts-expect-error
c1.deltaE(c2, { method: "abcdef" });

c1.deltaE(c2); // $ExpectType number
c1.deltaE(c2, "2000"); // $ExpectType number
c1.deltaE(c2, { method: "2000" }); // $ExpectType number
