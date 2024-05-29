/**
 * @packageDocumentation
 * This module defines all the builtin deltaE methods.
 */
import deltaE76 from "./deltaE76.js";
import deltaECMC from "./deltaECMC.js";
import deltaE2000 from "./deltaE2000.js";
import deltaEJz from "./deltaEJz.js";
import deltaEITP from "./deltaEITP.js";
import deltaEOK from "./deltaEOK.js";
import deltaEOK2 from "./deltaEOK2.js";
import deltaEHCT from "./deltaEHCT.js";

export {
	deltaE76,
	deltaECMC,
	deltaE2000,
	deltaEJz,
	deltaEITP,
	deltaEOK,
	deltaEOK2,
	deltaEHCT,
};

export default {
	deltaE76,
	deltaECMC,
	deltaE2000,
	deltaEJz,
	deltaEITP,
	deltaEOK,
	deltaEOK2,
	deltaEHCT,
};

/** @typedef {keyof typeof import("./index.js").default extends `deltaE${infer Method}` ? Method : string} Methods */
