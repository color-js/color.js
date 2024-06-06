import ColorSpace from "../ColorSpace.js";
import * as spaces from "./index-fn.js";

for (let key of Object.keys(spaces)) {
	ColorSpace.register(spaces[key]);
}

export * as spaces from "./index-fn.js";
export default ColorSpace;
