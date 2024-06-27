import Color from "colorjs.io/src/color";
import contrast from "colorjs.io/src/contrast";
import { contrastAPCA } from "colorjs.io/src/index-fn";

const c1 = new Color("red");
const c2 = new Color("blue");

// @ts-expect-error
contrast();
// @ts-expect-error
contrast(c1);
// @ts-expect-error
contrast(c1, c2);

// @ts-expect-error
contrast(c1, c2, "abc");

// @ts-expect-error
contrast(c1, c2, { algorithm: "abc" });

contrast(c1, c2, "APCA"); // $ExpectType number
contrast(c1, c2, { algorithm: "APCA" }); // $ExpectType number

// Make sure that contrast methods are properly re-exported
contrastAPCA("red", "blue"); // $ExpectType number

// @ts-expect-error
c1.contrast(c2);

// @ts-expect-error
c1.contrast(c2, "abc");

// @ts-expect-error
c1.contrast(c2, { algorithm: "abc" });

c1.contrast(c2, "APCA"); // $ExpectType number
c1.contrast(c2, { algorithm: "APCA" }); // $ExpectType number
c1.contrastAPCA(c2); // $ExpectType number
