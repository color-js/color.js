import distance from "../distance.js";
import getColor from "../getColor.js";

export default function deltaE76 (color, sample) {
	// Assume getColor() is called in the distance function
	return distance(color, sample, "lab");
}
