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
	return value.toLocaleString("en", options);
}
