import ictcp from "../spaces/ictcp.js";
import getColor from "../getColor.js";

// Delta E in ICtCp space,
// which the ITU calls Delta E ITP, which is shorter
// formulae from ITU Rec. ITU-R BT.2124-0

export default function (color, sample) {
	[color, sample] = getColor([color, sample]);

	// Given this color as the reference
	// and a sample,
	// calculate deltaE in ICtCp
	// which is simply the Euclidean distance

	let [ I1, T1, P1 ] = ictcp.from(color);
	let [ I2, T2, P2 ] = ictcp.from(sample);

	// the 0.25 factor is to undo the encoding scaling in Ct
	// the 720 is so that 1 deltaE = 1 JND
	// per  ITU-R BT.2124-0 p.3

	return 720 * Math.sqrt((I1 - I2) ** 2 + (0.25 * (T1 - T2) ** 2) + (P1 - P2) ** 2);
}
