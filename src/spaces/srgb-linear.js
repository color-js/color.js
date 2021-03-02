import Color from "./srgb.js";

// This is the linear-light version of sRGB
// as used for example in SVG filters
// or in Canvas

Color.defineSpace({
	inherits: "srgb",
	id: "srgb-linear",
	name: "sRGB-linear",
    toLinear(RGB) {
        return RGB;
    },
    toGamma(RGB) {
        return RGB;
    },
});

export default Color;

