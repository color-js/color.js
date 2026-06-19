import GamutRelativeColorSpace from "../GamutRelativeColorSpace.js";
import OKLCH from "./oklch.js";
import P3 from "./p3.js";

export default new GamutRelativeColorSpace({
	id: "oklch-p3",
	cssId: "--oklch-p3",
	name: "OKLCh P3",
	base: OKLCH,
	gamutSpace: P3,
});
