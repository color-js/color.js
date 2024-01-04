// Definitions by: Adam Thompson-Sharpe <https://github.com/MysteryBlokHed>
// Minimum TypeScript Version: 4.1
export { default } from "./src/index.js";

export type {
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
} from "./src/color.js";

export type { White } from "./src/adapt.js";

export type { CAT } from "./src/CATs.js";

export type { Display } from "./src/display.js";

export type {
	Range,
	RangeOptions,
	MixOptions,
	StepsOptions,
} from "./src/interpolation.js";

export type { Options as ParseOptions } from "./src/parse.js";

export type { RGBOptions } from "./src/rgbspace.js";

export type { Options as SerializeOptions } from "./src/serialize.js";

export type {
	Format as SpaceFormat,
	CoordMeta,
	Ref,
	Options as SpaceOptions,
} from "./src/space.js";
