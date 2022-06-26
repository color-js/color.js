// Global defaults one may want to configure
const hasDOM = typeof document !== "undefined";

export default {
	gamut_mapping: "lch.c",
	precision: 5,
	deltaE: "76", // Default deltaE method
	css_space: "srgb", // Default space for CSS output. Code in Color.js makes this wider if there's a DOM available
}