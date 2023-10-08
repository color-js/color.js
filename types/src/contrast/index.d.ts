export type Algorithms =
	keyof typeof import("./index.js") extends `contrast${infer Alg}`
		? Alg
		: string;

export { default as contrastWCAG21 } from "./WCAG21.js";
export { default as contrastAPCA } from "./APCA.js";
export { default as contrastMichelson } from "./Michelson.js";
export { default as contrastWeber } from "./Weber.js";
export { default as contrastLstar } from "./Lstar.js";
export { default as contrastDeltaPhi } from "./deltaPhi.js";
