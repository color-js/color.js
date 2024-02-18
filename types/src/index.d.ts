import { uv, xy } from "./chromaticity.js";
import Color, { ColorTypes, ToColorPrototype } from "./color.js";
import contrast from "./contrast.js";
import {
	contrastWCAG21,
	contrastAPCA,
	contrastMichelson,
	contrastWeber,
	contrastLstar,
	contrastDeltaPhi,
} from "./contrast/index.js";
import deltaE from "./deltaE.js";
import deltaEMethods, {
	deltaE76,
	deltaECMC,
	deltaE2000,
	deltaEJz,
	deltaEITP,
	deltaEOK,
} from "./deltaE/index.js";
import { range, Range, MixOptions, StepsOptions } from "./interpolation.js";
import { getLuminance } from "./luminance.js";
import { lighten, darken } from "./variations.js";

// Augment existing Color object
declare module "./color" {
	export default class Color {
		// chromaticity
		uv: ToColorPrototype<typeof uv>;
		xy: ToColorPrototype<typeof xy>;

		// contrast
		contrast: ToColorPrototype<typeof contrast>;
		static contrast: typeof contrast;

		// contrastMethods
		contrastWCAG21: ToColorPrototype<typeof contrastWCAG21>;
		contrastAPCA: ToColorPrototype<typeof contrastAPCA>;
		contrastMichelson: ToColorPrototype<typeof contrastMichelson>;
		contrastWeber: ToColorPrototype<typeof contrastWeber>;
		contrastLstar: ToColorPrototype<typeof contrastLstar>;
		contrastDeltaPhi: ToColorPrototype<typeof contrastDeltaPhi>;

		static contrastWCAG21: typeof contrastWCAG21;
		static contrastAPCA: typeof contrastAPCA;
		static contrastMichelson: typeof contrastMichelson;
		static contrastWeber: typeof contrastWeber;
		static contrastLstar: typeof contrastLstar;
		static contrastDeltaPhi: typeof contrastDeltaPhi;

		// deltaE
		deltaE: ToColorPrototype<typeof deltaE>;
		deltaE76: ToColorPrototype<typeof deltaE76>;
		deltaECMC: ToColorPrototype<typeof deltaECMC>;
		deltaE2000: ToColorPrototype<typeof deltaE2000>;
		deltaEJz: ToColorPrototype<typeof deltaEJz>;
		deltaEITP: ToColorPrototype<typeof deltaEITP>;
		deltaEOK: ToColorPrototype<typeof deltaEOK>;

		static deltaE: typeof deltaE;
		static deltaE76: typeof deltaE76;
		static deltaECMC: typeof deltaECMC;
		static deltaE2000: typeof deltaE2000;
		static deltaEJz: typeof deltaEJz;
		static deltaEITP: typeof deltaEITP;
		static deltaEOK: typeof deltaEOK;
		static deltaEMethods: typeof deltaEMethods;

		// interpolation
		// These signatures should always match those in interpolation.d.ts,
		// including the static versions
		/** Create color mixtures in any desired proportion between two colors */
		mix (color2: ColorTypes, options?: MixOptions): Color;
		mix (color2: ColorTypes, p: number, options?: MixOptions): Color;
		/**
		 * Creates a function that accepts a number and returns a color.
		 * For numbers in the range 0 to 1, the function interpolates;
		 * for numbers outside that range, the function extrapolates
		 * (and thus may not return the results you expect)
		 */
		range: ToColorPrototype<typeof range>;
		/** Get an array of discrete steps */
		steps (color2: ColorTypes, options?: StepsOptions): Color[];

		/** Create color mixtures in any desired proportion between two colors */
		static mix (
			color1: ColorTypes,
			color2: ColorTypes,
			options?: MixOptions
		): Color;
		static mix (
			color1: ColorTypes,
			color2: ColorTypes,
			p: number,
			options?: MixOptions
		): Color;
		/**
		 * Creates a function that accepts a number and returns a color.
		 * For numbers in the range 0 to 1, the function interpolates;
		 * for numbers outside that range, the function extrapolates
		 * (and thus may not return the results you expect)
		 */
		static range: typeof range;
		/** Get an array of discrete steps */
		static steps (
			color1: ColorTypes,
			color2: ColorTypes,
			options?: StepsOptions
		): Color[];
		static steps (range: Range, options?: StepsOptions): Color[];

		// luminance
		get luminance (): ReturnType<typeof getLuminance>;
		// the definition for this set in the orignial code like it doesn't actually use the parameter?
		set luminance (_: number);

		// variations
		lighten: ToColorPrototype<typeof lighten>;
		darken: ToColorPrototype<typeof darken>;
		static lighten: typeof lighten;
		static darken: typeof darken;
	}
}

export default Color;
