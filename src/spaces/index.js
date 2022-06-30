import ColorSpace from "../space.js";

import * as spaces from './index-fn.js';

ColorSpace.register(spaces.XYZ_D65);
// ...

// Register xyz alias
ColorSpace.register("xyz", XYZ_D65);
XYZ_D65.formats.color.ids ||= [];
XYZ_D65.formats.color.ids.push("xyz");
