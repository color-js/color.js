import ColorSpace from "../ColorSpace.js";

export default new ColorSpace({
	id: "xyz-d65",
	name: "XYZ D65",
	coords: {
		x: {
			refRange: [0, 1],
			name: "X",
		},
		y: {
			refRange: [0, 1],
			name: "Y",
		},
		z: {
			refRange: [0, 1],
			name: "Z",
		},
	},
	white: "D65",
	formats: {
		color: {
			ids: ["xyz-d65", "xyz"],
		},
	},
	aliases: ["xyz"],
});
