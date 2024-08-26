import RGBColorSpace from "../RGBColorSpace.js";
import REC_2020_Linear from "./rec2020-linear.js";

export default new RGBColorSpace({
	id: "rec2100-linear",
	name: "Linear REC.2100",
	white: "D65",
	toBase: REC_2020_Linear.toBase,
	fromBase: REC_2020_Linear.fromBase,
});
