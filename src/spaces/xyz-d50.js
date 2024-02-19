import ColorSpace from "../space.js";
import adapt from "../adapt.js";
import XYZ_D65 from "./xyz-d65.js";

export default new ColorSpace({
	id: "xyz-d50",
	name: "XYZ D50",
	white: "D50",
	base: XYZ_D65,
	fromBase: coords => adapt(XYZ_D65.white, "D50", coords),
	toBase: coords => adapt("D50", XYZ_D65.white, coords),
});
