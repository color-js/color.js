import RGBColorSpace from "colorjs.io/src/RGBColorSpace.js";

// @ts-expect-error
new RGBColorSpace();
// @ts-expect-error
new RGBColorSpace({});

new RGBColorSpace({
	name: "RGBSpace",
	id: "rgbspace",
});

new RGBColorSpace({
	name: "RGBSpace",
	id: "rgbspace",
	toXYZ_M: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
	fromXYZ_M: [[3, 2, 1], [6, 5, 4], [9, 8, 7]],
});
