import { lerpColorByHue, isCW } from "../utils.js";

export function fixColorSection (section) {
	let result = [];
	let hasError = false;

	section.forEach((color, idx, list) => {
		if (idx === 0) {
			result.push(color);
			return;
		}
		const willGoCW = idx === list.length - 1 || isCW(color.h, list[idx + 1].h);

		if (willGoCW) {
			// Will go in right direction
			if (hasError) {
				// Had error. It is the end of faulty section
				const firstFaultyIdx = result.findIndex(
					(addedColor) => !isCW(addedColor.h, color.h),
				);
				const replacementColor = lerpColorByHue(
					result[firstFaultyIdx - 1],
					result[firstFaultyIdx],
					color.h - 0.0001,
				);
				result = [...result.slice(0, firstFaultyIdx), replacementColor, color];
				hasError = false;
				return;
			}
			else {
				result.push(color);
				return;
			}
		}
		else {
			// Will go in wrong direction
			if (hasError) {
				// Already set an error. Skip
				return;
			}
			else {
				// It is the start of faulty section
				hasError = true;
				result.push(color); // in case we need this color to fix the section
				return;
			}
		}
	});

	return result;
}
