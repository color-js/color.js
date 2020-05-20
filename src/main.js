// Import all modules of Color.js
import Color, {util} from "./color.js";

// Import color spaces
import "./spaces/lab-lch.js";
import "./spaces/srgb.js";
import "./spaces/hsl.js";
import "./spaces/hwb.js";
import "./spaces/p3.js";
import "./spaces/a98rgb.js";
import "./spaces/prophoto.js";
import "./spaces/rec2020.js";

// Import optional modules
import "./interpolation.js";

// Re-export everything
export default Color;
export {util};
