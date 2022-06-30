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
		color: {}
	},
});

export default XYZ;

// Register xyz alias
ColorSpace.register("xyz", XYZ);
XYZ.formats.color.ids ||= [];
XYZ.formats.color.ids.push("xyz");