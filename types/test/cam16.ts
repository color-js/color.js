import { environment, fromCam16 } from "colorjs.io/src/spaces/cam16";

const viewingConditions = environment(
	[1, 2, 3],
	64 / Math.PI * 0.2,	20,
	"average",
	false,
);
// @ts-expect-error
fromCam16({}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0}, viewingConditions);

// @ts-expect-error
fromCam16({C: 0}, viewingConditions);

// @ts-expect-error
fromCam16({h: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, C: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, H: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, C: 0, H: 0, Q: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, C: 0, H: 0, M: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, C: 0, H: 0, s: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, M: 0, H: 0, s: 0}, viewingConditions);

// @ts-expect-error
fromCam16({J: 0, C: 0, H: 0, h: 0}, viewingConditions);

fromCam16({J: 0, C: 0, H: 0}, viewingConditions); // $ExpectType [number, number, number]
fromCam16({Q: 0, M: 0, h: 0}, viewingConditions); // $ExpectType [number, number, number]
fromCam16({Q: 0, s: 0, h: 0}, viewingConditions); // $ExpectType [number, number, number]


