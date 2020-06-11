// Import all modules of Color.js
import Color, {util} from "./color.js";

// Import color spaces
import "./spaces/lab.js";
import "./spaces/lch.js";
import "./spaces/srgb.js";
import "./spaces/hsl.js";
import "./spaces/hwb.js";
import "./spaces/hsv.js";
import "./spaces/p3.js";
import "./spaces/a98rgb.js";
import "./spaces/prophoto.js";
import "./spaces/rec2020.js";
import "./spaces/jzazbz.js";
import "./spaces/jzczhz.js";

// Import optional modules
import "./interpolation.js";
import "./deltaE/deltaECMC.js";
import "./deltaE/deltaE2000.js";
import "./deltaE/deltaEJz.js";

// Re-export everything
export default Color;
export {util};
