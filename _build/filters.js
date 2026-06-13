import * as path from "path";

export function relative (page) {
	let pagePath = page.url.replace(/[^/]+$/, "");
	let ret = path.relative(pagePath, "/");

	return ret || ".";
}

export function unslugify (slug) {
	return slug.replace(/(^|-)([a-z])/g, ($0, $1, $2) => ($1 ? " " : "") + $2.toUpperCase());
}

export function number (value, options) {
	return value?.toLocaleString("en", options);
}

export function randomNumber (max, min, step) {
	step ??= (max - min) / 100;
	// Round to nearest power of 10
	step = Math.pow(10, Math.floor(Math.log10(step)));

	return Math.floor((Math.random() * (max - min + step)) / step) * step + min;
}

/**
 * Format a date for display, e.g. "December 24, 2025".
 * 11ty passes `page.date` as a Date, but accept date strings too.
 * @param {Date | string} value
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export function date (value, options = { dateStyle: "long" }) {
	value = typeof value === "string" ? new Date(value) : value;
	return value?.toLocaleString("en", options);
}
