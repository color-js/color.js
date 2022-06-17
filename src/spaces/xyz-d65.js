import ColorSpace from "../space.js";

const space = ColorSpace.create({
	id: "xyz-d65",
	name: "XYZ D65",
	coords: ["x", "y", "z"],
	white: "D65"
});

export default space;

// Register xyz alias
ColorSpace.register("xyz", space);