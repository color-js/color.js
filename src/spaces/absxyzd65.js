import Color from "./../color.js";

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
	inGamut: _coords => true,
    fromXYZ (XYZ) {

		const {Yw} = this;

		// Make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
        // Relative XYZ has Y=1 for media white

        return XYZ.map (function (val) {
			return Math.max(val * Yw, 0);
		});
    },
    toXYZ (AbsXYZ) {

		// Convert to media-white relative XYZ

		const {Yw} = this;

		let XYZ = AbsXYZ.map (function (val) {
			return Math.max(val / Yw, 0);
        });

		return XYZ;
	}
});
