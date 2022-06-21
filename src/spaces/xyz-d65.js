import ColorSpace from "../space.js";

const XYZ = ColorSpace.create({
	id: "xyz-d65",
	name: "XYZ D65",
	coords: {
		x: {name: "X"},
		y: {name: "Y"},
		z: {name: "Z"},
	},
	white: "D65",
	formats: {
		functions: {
			color: {}
		}
	},
});

export default XYZ;

// Register xyz alias
ColorSpace.register("xyz", XYZ);
XYZ.formats.functions.color.ids ||= [];
XYZ.formats.functions.color.ids.push("xyz");