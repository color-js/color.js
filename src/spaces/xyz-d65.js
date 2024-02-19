import ColorSpace from "../space.js";

export default new ColorSpace({
	id: "xyz-d65",
	name: "XYZ D65",
	coords: {
		x: {name: "X"},
		y: {name: "Y"},
		z: {name: "Z"},
	},
	white: "D65",
	formats: {
		color: {
			ids: ["xyz-d65", "xyz"],
		},
	},
	aliases: ["xyz"],
});
