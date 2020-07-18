import Color, {util} from "./../color.js";

Color.defineSpace({
// Absolute CIE XYZ, with a D65 whitepoint,
// as used in most HDR colorspaces as a starting point.
// SDR spaces are converted per BT.2048
// so that diffuse, media white is 203 cd/m²
    id: "absxyzd65",
    name: "Absolute XYZ D65",
	coords: {
		Xa: [0, 9504.7],
		Ya: [0, 10000],
		Za: [0, 10888.3]
	},
    white: Color.whites.D65,
    Yw: 203,	// absolute luminance of media white
	inGamut: coords => true,
    fromXYZ (XYZ) {

		// First adapt from D50 to D65, with linear Bradford default

		const W1 = Color.whites.D50;
		const W2 = Color.whites.D65;

		XYZ = Color.chromaticAdaptation(W1, W2, XYZ);

		const {Yw} = this;

		// Then make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
        // Relative XYZ has Y=1 for media white

        return XYZ.map (function (val) {
			return Math.max(val * Yw, 0);
		});
    },
    toXYZ (AbsXYZ) {

		// First convert to media-white relative XYZ

		const {Yw} = this;

		let XYZ = AbsXYZ.map (function (val) {
			return Math.max(val / Yw, 0);
        });

		// Then adapt to D50
		const W1 = Color.whites.D65;
		const W2 = Color.whites.D50;
		return Color.chromaticAdaptation(W1, W2, XYZ);
	}
});
