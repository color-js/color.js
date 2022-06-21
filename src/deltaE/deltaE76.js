import {register} from "../deltaE.js";

export default register("76", (color, sample) => {
	return color.distance(sample, "lab");
});