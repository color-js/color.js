export type Spaces = keyof typeof import("./index-fn.js");

export { default as XYZ_D65 } from "./xyz-d65.js";
export { default as XYZ_D50 } from "./xyz-d50.js";
export { default as XYZ_ABS_D65 } from "./xyz-abs-d65.js";
export { default as Lab } from "./lab.js";
export { default as Lab_D65 } from "./lab-d65.js";
export { default as LCH } from "./lch.js";
export { default as sRGB_Linear } from "./srgb-linear.js";
export { default as sRGB } from "./srgb.js";
export { default as HSL } from "./hsl.js";
export { default as HWB } from "./hwb.js";
export { default as HSV } from "./hsv.js";
export { default as P3_Linear } from "./p3-linear.js";
export { default as P3 } from "./p3.js";
export { default as A98RGB_Linear } from "./a98rgb-linear.js";
export { default as A98RGB } from "./a98rgb.js";
export { default as ProPhoto_Linear } from "./prophoto-linear.js";
export { default as ProPhoto } from "./prophoto.js";
export { default as REC_2020_Linear } from "./rec2020-linear.js";
export { default as REC_2020 } from "./rec2020.js";
export { default as OKLab } from "./oklab.js";
export { default as OKLCH } from "./oklch.js";
export { default as Luv } from "./luv.js";
export { default as LCHuv } from "./lchuv.js";
export { default as HSLuv } from "./hsluv.js";
export { default as HPLuv } from "./hpluv.js";

export * from "./index-fn-hdr.js";
