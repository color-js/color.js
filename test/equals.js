import Color from "../src/index.js";
import equals from "../src/equals.js";
import sRGB from "../src/spaces/srgb.js";
import P3 from "../src/spaces/p3.js";

let color = { space: sRGB, coords: [1, 0, 0], alpha: 1 };
let proxy = { ...color, space: new Proxy(sRGB, {}) };

export default {
	name: "Color equality",
	run: equals,
	tests: [
		{ name: "Same space", args: [color, { ...color }], expect: true },
		{ name: "Proxied space", args: [color, proxy], expect: true },
		{ name: "Proxied space first", args: [proxy, color], expect: true },
		{
			name: "Different space",
			args: [color, { ...color, space: P3 }],
			expect: false,
		},
		{
			name: "Different coordinates",
			args: [color, { ...proxy, coords: [0, 1, 0] }],
			expect: false,
		},
		{
			name: "Different alpha",
			args: [color, { ...proxy, alpha: 0.5 }],
			expect: false,
		},
		{
			name: "Color instance method",
			run: () => new Color(color).equals(proxy),
			expect: true,
		},
	],
};
