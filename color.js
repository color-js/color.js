import Color, {util} from "./src/color.js";
import "./src/space-lab-lch.js";
import "./src/space-srgb.js";
import "./src/space-hsl.js";
import "./src/space-p3.js";
import "./src/space-a98rgb.js";
import "./src/space-prophoto.js";
import "./src/space-rec2020.js";

window.Color = window.Color || Color;

export default Color;
export {util};
