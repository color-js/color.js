/* eslint-disable curly */
import { parseFunction } from "./parse.js";
import KEYWORDS from "./keywords.js";

/**
 * Verify string can be parsed into a color object
 * @param {String} str
 * @returns boolean
 */
export default function isValid (str) {
	if (!str) return false;
	if (isColorHex(str)) return true;
	if (isTransparent(str)) return true;
	return validateParsedValue(str, parseFunction(str));
}

/**
 * Return if parsed is valid and not a rgb function with angles
 * @param {String} str
 * @param {any} parsed
 * @returns boolean
 */
const validateParsedValue = (str, parsed) => {
	return !isParsedValid(parsed, str) || isParsedRGBWithAngles(parsed) ? false : true;
};

/**
 * Return if string is "transparent"
 * @param {String} str
 * @returns boolean
 */
const isTransparent = str => {
	return str === "transparent";
};

/**
 * Return if parsed is valid
 * @param {any} parsed
 * @param {String} str
 * @returns boolean
 */
const isParsedValid = (parsed, str) => {
	if (
		!parsed ||
		!parsed.name ||
		parsed.argMeta.filter(item => isTypeNumberPercentageOrAngle(item.type)).length < 3 ||
		parsed.argMeta.filter(item => isTypeNumberPercentageOrAngle(item.type)).length > 4
	) {
		if (!KEYWORDS[str.toLowerCase()]) return false;
	}
	return true;
};

/**
 * Return if parsed is a rgb function with angles
 * @param {any} parsed
 * @returns boolean
 */
const isParsedRGBWithAngles = parsed => {
	if (
		parsed &&
		parsed.name === "rgb" &&
		parsed.argMeta.filter(item => item.type === "<angle>").length
	) {
		return true;
	}
	return false;
};

/**
 * Return if string is a number, percentage or angle
 * @param {String} type
 * @returns boolean
 */
const isTypeNumberPercentageOrAngle = type => {
	return type === "<number>" || type === "<percentage>" || type === "<angle>" || !type;
};

/**
 * Verify string is valid hex
 * @param {String} str
 * @returns boolean
 */
function isColorHex (str) {
	const isString = color => color && typeof color === "string";
	if (isString(str)) {
		const regex = /^#([\da-f]{3}){1,2}$|^#([\da-f]{4}){1,2}$/i;
		return str && regex.test(str);
	}
	return false;
}
