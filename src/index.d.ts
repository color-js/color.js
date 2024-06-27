// Type re-exports
export {
	// Re-exported from src/color.d.ts
	ColorConstructor,
	ColorObject,
	ColorTypes,
	Coords,
	DefineFunctionCode,
	DefineFunctionOptions,
	DefineFunctionHybrid,
	PlainColorObject,
	SpaceAccessor,
	ToColorPrototype,
	// Re-exported from src/adapt.d.ts
	White,
	// Re-exported from src/CATs.d.ts
	CAT,
	// Re-exported from src/display.d.ts
	Display,
	// Re-exported from src/interpolation.d.ts
	Range,
	RangeOptions,
	MixOptions,
	StepsOptions,
	// Re-exported from src/parse.d.ts
	ParseOptions,
	// Re-exported from src/rgbspace.d.ts
	RGBOptions,
	// Re-exported from src/serialize.d.ts
	SerializeOptions,
	// Re-exported from src/space.d.ts
	Format as SpaceFormat,
	CoordMeta,
	Ref,
	SpaceOptions,
} from "./types.js";

import Color from "./color.js";
// Module augmentation has instead been merged with the definition in `color.d.ts`.
// If any new properties are added to the JS source, place them in `color.d.ts`
export default Color;
