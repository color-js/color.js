/**
 * @packageDocumentation
 * A functional, tree-shakeable version of the Color.js API.
 * This module allows developers to selectively import
 * the classes and functions that they wish to use in their project.
 * Import as `colorjs.io/fn`
 */
export { default as ColorSpace }          from "./ColorSpace.js";
export { default as RGBColorSpace }       from "./RGBColorSpace.js";
export { default as hooks, Hooks }        from "./hooks.js";
export { default as defaults }            from "./defaults.js";
export { default as getColor }            from "./getColor.js";
export { default as tryColor }            from "./tryColor.js";
export { default as get }                 from "./get.js";
export { default as getAll }              from "./getAll.js";
export { default as set }                 from "./set.js";
export { default as setAll }              from "./setAll.js";
export { default as parse }               from "./parse.js";
export { default as to }                  from "./to.js";
export { default as serialize }           from "./serialize.js";
export { default as display }             from "./display.js";
export { default as inGamut }             from "./inGamut.js";
export { default as toGamut, toGamutCSS } from "./toGamut.js";
export { default as distance }            from "./distance.js";
export { default as deltas }              from "./deltas.js";
export { default as equals }              from "./equals.js";
export { default as contrast }            from "./contrast.js";
export { default as clone }               from "./clone.js";
export { getLuminance, setLuminance }     from "./luminance.js";
export { uv, xy }                         from "./chromaticity.js";
export *                                  from "./contrast/index.js";
export { default as deltaE }              from "./deltaE.js";
export *                                  from "./deltaE/index.js";
export { default as deltaEMethods }       from "./deltaE/index.js";
export *                                  from "./variations.js";
export { mix, steps, range, isRange }     from "./interpolation.js";

// Export all color spaces as a single object as well so they can be registered in one go (#661)
import * as spaces from "./spaces/index-fn.js";
export { spaces }
export *                                  from "./spaces/index-fn.js";

// Type re-exports
// Re-exported from src/color.d.ts
/** @typedef {import("./types.js").ColorConstructor} ColorConstructor */
/** @typedef {import("./types.js").ColorObject} ColorObject */
/** @typedef {import("./types.js").ColorTypes} ColorTypes */
/** @typedef {import("./types.js").Coords} Coords */
/** @typedef {import("./types.js").DefineFunctionCode} DefineFunctionCode */
/** @typedef {import("./types.js").DefineFunctionOptions} DefineFunctionOptions */
/** @typedef {import("./types.js").DefineFunctionHybrid} DefineFunctionHybrid */
/** @typedef {import("./types.js").PlainColorObject} PlainColorObject */
/** @typedef {import("./types.js").SpaceAccessor} SpaceAccessor */
/**
 * @typedef {import("./types.js").ToColorPrototype<T>} ToColorPrototype
 * @template {(...args: any[]) => any} T
 */
// Re-exported from src/adapt.d.ts
/** @typedef {import("./types.js").White} White */
// Re-exported from src/CATs.d.ts
/** @typedef {import("./types.js").CAT} CAT */
// Re-exported from src/display.d.ts
/** @typedef {import("./types.js").Display} Display */
// Re-exported from src/interpolation.d.ts
/** @typedef {import("./types.js").Range} Range */
/** @typedef {import("./types.js").RangeOptions} RangeOptions */
/** @typedef {import("./types.js").MixOptions} MixOptions */
/** @typedef {import("./types.js").StepsOptions} StepsOptions */
// Re-exported from src/parse.d.ts
/** @typedef {import("./types.js").ParseOptions} ParseOptions */
// Re-exported from src/rgbspace.d.ts
/** @typedef {import("./types.js").RGBOptions} RGBOptions */
// Re-exported from src/serialize.d.ts
/** @typedef {import("./types.js").SerializeOptions} SerializeOptions */
// Re-exported from src/space.d.ts
/** @typedef {import("./types.js").Format} SpaceFormat */
/** @typedef {import("./types.js").CoordMeta} CoordMeta */
/** @typedef {import("./types.js").Ref} Ref */
/** @typedef {import("./types.js").SpaceOptions} SpaceOptions */
// Re-exported from src/deltas.d.ts
/** @typedef {import("./types.js").DeltasReturn} DeltasReturn */
