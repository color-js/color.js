import GamutRelativeColorSpace from "../GamutRelativeColorSpace.js";
import OKLCH from "./oklch.js";
import REC2020 from "./rec2020.js";

export default new GamutRelativeColorSpace({
	id: "oklch-rec2020",
	cssId: "--oklch-rec2020",
	name: "OKLCh Rec.2020",
	base: OKLCH,
	gamutSpace: REC2020,
});
