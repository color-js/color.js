import distance from "../distance.js";
import getColor from "../getColor.js";

export default function deltaE76 (color, sample) {
	return distance(getColor(color), getColor(sample), "lab");
}
