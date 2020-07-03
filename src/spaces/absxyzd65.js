import Color, {util} from "./../color.js";

Color.defineSpace({
// Absolute CIE XYZ, with a D65 whitepoint,
// as used in most HDR colorspaces as a starting point.
// SDR spaces are converted per BT.2048
// so that diffuse, media white is 203 cd/m²
    id: "absxyzd65",
    name: "AbsXYZD65",
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
        let env = { W1, W2, XYZ, options};

		Color.hooks.run("chromatic-adaptation-start", env);

		if (!env.M) {
			env.M = [
				[ 0.9555766, -0.0230393,  0.0631636],
				[-0.0282895,  1.0099416,  0.0210077],
				[ 0.0122982, -0.0204830,  1.3299098]
			];
		}

		Color.hooks.run("chromatic-adaptation-end", env);

		XYZ = util.multiplyMatrices(env.M, env.XYZ);

		const {Yw} = this;

		// Then make XYZ absolute, not relative to media white
		// Maximum luminance in PQ is 10,000 cd/m²
        // Relative XYZ has Y=1 for media white

        let AbsXYZ = XYZ.map (function (val) {
			return Math.max(val * Yw, 0);
		});

		return AbsXYZ;
    },
    toXYZ (AbsXYZ) {

		// First convert to mdia-white relative XYZ

		let XYZ = AbsXYZ.map (function (val) {
			return Math.max(val / Yw, 0);
        });

		// Then adapt to D50

		const W1 = Color.whites.D65;
		const W2 = Color.whites.D50;
        let env = { W1, W2, XYZ, options};

		Color.hooks.run("chromatic-adaptation-start", env);

		if (!env.M) {
			env.M = [
				[ 1.0478112,  0.0228866, -0.0501270],
				[ 0.0295424,  0.9904844, -0.0170491],
				[-0.0092345,  0.0150436,  0.7521316]
		];
	}

	Color.hooks.run("chromatic-adaptation-end", env);

	return util.multiplyMatrices(env.M, env.XYZ);
	}
});
