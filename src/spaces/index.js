import ColorSpace from "../space.js";

import * as spaces from './index-fn.js';

ColorSpace.register(spaces.XYZ_D65);
// ...

// Register xyz alias
ColorSpace.register("xyz", XYZ);
XYZ.formats.color.ids ||= [];
XYZ.formats.color.ids.push("xyz");
