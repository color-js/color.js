export { default as deltaE76 } from "./deltaE76.js";
export { default as deltaECMC } from "./deltaECMC.js";
export { default as deltaE2000 } from "./deltaE2000.js";
export { default as deltaEJz } from "./deltaEJz.js";
export { default as deltaEITP } from "./deltaEITP.js";
export { default as deltaEOK } from "./deltaEOK.js";
export { default as deltaEHCT } from "./deltaEHCT.js";

declare const deltaEMethods: Omit<typeof import("./index.js"), "default">;
export default deltaEMethods;

export type Methods = keyof typeof deltaEMethods extends `deltaE${infer Method}`
	? Method
	: string;
