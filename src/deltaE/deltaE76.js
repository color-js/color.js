import distance from "../distance.js";

export default function deltaE76 (color, sample) {
	return distance(color, sample, "lab");
};
