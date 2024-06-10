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
	toXYZ_M: [[1, 2, 3]],
	fromXYZ_M: [[3, 2, 1]],
});
