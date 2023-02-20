import { uv, xy } from "./chromaticity";
import Color from "./color";
import contrast from "./contrast";
import {
	contrastWCAG21,
	contrastAPCA,
	contrastMichelson,
	contrastWeber,
	contrastLstar,
	contrastDeltaPhi,
} from "./contrast/index";
import deltaE from "./deltaE";
import deltaEMethods, {
	deltaE76,
	deltaECMC,
	deltaE2000,
	deltaEJz,
	deltaEITP,
	deltaEOK,
} from "./deltaE/index";
import { mix, range, steps } from "./interpolation";
import { getLuminance } from "./luminance";
import { lighten, darken } from "./variations";

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
		mix: ToColorPrototype<typeof mix>;
		range: ToColorPrototype<typeof range>;
		steps: ToColorPrototype<typeof steps>;
		static mix: typeof mix;
		static range: typeof range;
		static steps: typeof steps;

		// luminance
		get luminance(): ReturnType<typeof getLuminance>;
		// the definition for this set in the orignial code like it doesn't actually use the parameter?
		set luminance(_: number);

		// variations
		lighten: ToColorPrototype<typeof lighten>;
		darken: ToColorPrototype<typeof darken>;
		static lighten: typeof lighten;
		static darken: typeof darken;
	}
}

export default Color;
