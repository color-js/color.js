import RGBColorSpace from "../RGBColorSpace.js";
// Same primaries and white point as Linear REC.2020, so it reuses its matrices
import { M } from "./rec2020-linear.js";

export { M };

export default new RGBColorSpace({
	id: "rec2100-linear",
	name: "Linear REC.2100",
	white: "D65",
	M,
});
