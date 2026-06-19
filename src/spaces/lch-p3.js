import GamutRelativeColorSpace from "../GamutRelativeColorSpace.js";
import LCH from "./lch.js";
import P3 from "./p3.js";

export default new GamutRelativeColorSpace({
	id: "lch-p3",
	cssId: "--lch-p3",
	name: "LCH P3",
	base: LCH,
	gamutSpace: P3,
});
