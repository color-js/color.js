import GamutRelativeColorSpace from "../GamutRelativeColorSpace.js";
import LCH from "./lch.js";
import REC2020 from "./rec2020.js";

export default new GamutRelativeColorSpace({
	id: "lch-rec2020",
	cssId: "--lch-rec2020",
	name: "LCH Rec.2020",
	base: LCH,
	gamutSpace: REC2020,
});
