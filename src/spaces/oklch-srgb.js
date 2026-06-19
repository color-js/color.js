import GamutRelativeColorSpace from "../GamutRelativeColorSpace.js";
import OKLCH from "./oklch.js";
import sRGB from "./srgb.js";

export default new GamutRelativeColorSpace({
	id: "oklch-srgb",
	cssId: "--oklch-srgb",
	name: "OKLCh sRGB",
	base: OKLCH,
	gamutSpace: sRGB,
});
