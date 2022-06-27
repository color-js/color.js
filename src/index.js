// Import all modules of Color.js
import Color from "./color.js";

// Import all color spaces
import "./spaces/index.js";

// Import all DeltaE methods
import * as deltaE from "./deltaE.js";
import * as deltaEMethods from "./deltaE/index.js";
for (let method in deltaEMethods) {
	let id = method.replace(/^deltaE/, "");
	deltaE.registerMethod(id, deltaEMethods[method]);
}
Color.extend(deltaE);

// Import optional modules
import * as variations from "./variations.js";
Color.extend(variations);

import * as contrast from "./contrast.js";
Color.extend(contrast);

import * as chromaticity from "./chromaticity.js";
Color.extend(chromaticity);

import * as luminance from "./luminance.js";
Color.extend(luminance);

import * as interpolation from "./interpolation.js";
Color.extend(interpolation);

import "./CATs.js";
import "./space-accessors.js";

// Re-export everything
export default Color;
