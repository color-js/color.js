// Testing whether types can be accessed from the main import

import {
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
	SpaceFormat,
	CoordMeta,
	Ref,
	SpacecOptions,
} from "colorjs.io";
