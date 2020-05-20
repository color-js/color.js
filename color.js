// Import all modules of Color.js and assign Color to a global,
// for easier testing and experimentation without building
import Color, {util} from "./src/main.js";

window.Color = window.Color || Color;

// Re-export
export default Color;
export {util};
