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

contrast(c1, c2, "APCA"); // $ExpectType number
contrast(c1, c2, { algorithm: "APCA" }); // $ExpectType number

// Make sure that contrast methods are properly re-exported
contrastAPCA("red", "blue"); // $ExpectType number
