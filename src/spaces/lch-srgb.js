import GamutRelativeColorSpace from "../GamutRelativeColorSpace.js";
import LCH from "./lch.js";
import sRGB from "./srgb.js";

export default new GamutRelativeColorSpace({
	id: "lch-srgb",
	cssId: "--lch-srgb",
	name: "LCH sRGB",
	base: LCH,
	gamutSpace: sRGB,
});
