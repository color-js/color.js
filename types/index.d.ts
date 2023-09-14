// Definitions by: Adam Thompson-Sharpe <https://github.com/MysteryBlokHed>
// Minimum TypeScript Version: 4.1
export { default } from "./dist/color";
export type {
	ColorConstructor,
	ColorObject,
	ColorTypes,
	Coords,
	DefineFunctionCode,
	DefineFunctionOptions,
	DefineFunctionHybrid,
	SpaceAccessor,
	ToColorPrototype,
} from "./src/color";

export type { CAT } from "./src/CATs";

export type { Display } from "./src/display";

export type {
	Range,
	RangeOptions,
	MixOptions,
	StepsOptions,
} from "./src/interpolation";

export type { Options as ParseOptions } from "./src/parse";

export type { RGBOptions } from "./src/rgbspace";

export type { Options as SerializeOptions } from "./src/serialize";

export type {
	Format as SpaceFormat,
	CoordMeta,
	Ref,
	Options as SpacecOptions,
} from "./src/space";
