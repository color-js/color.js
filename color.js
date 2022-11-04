// Import all modules of Color.js and assign Color to a global,
// for easier testing and experimentation without building
import Color from "./src/index.js";
import * as util from "./src/util.js";

window.Color = window.Color || Color;

// Re-export
export default Color;
export {util};
