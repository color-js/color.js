/**
 * Entry point for the OOP flavor of the API
 * Import as `colorjs.io`
 */
import Color from "./color.js";

// Import all color spaces
import "./spaces/index.js";

// Import all DeltaE methods
import deltaE from "./deltaE.js";
import deltaEMethods from "./deltaE/index.js";

Color.extend(deltaEMethods);
Color.extend({ deltaE });
Object.assign(Color, { deltaEMethods });

// Import optional modules
import * as variations from "./variations.js";
Color.extend(variations);

import contrast from "./contrast.js";
Color.extend({ contrast });

import * as chromaticity from "./chromaticity.js";
Color.extend(chromaticity);

import * as luminance from "./luminance.js";
Color.extend(luminance);

import * as interpolation from "./interpolation.js";
Color.extend(interpolation);

import * as contrastMethods from "./contrast/index.js";
Color.extend(contrastMethods);

import "./CATs.js";
import "./space-accessors.js";

// Re-export everything
export default Color;
