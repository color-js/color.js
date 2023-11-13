const check = await importWithFallback("../node_modules/htest.dev/src/check.js", "https://htest.dev/src/check.js");
const map = await importWithFallback("../node_modules/htest.dev/src/map.js", "https://htest.dev/src/map.js");

export { check, map };

export async function importWithFallback (...specifiers) {
	for (let i = 0; i < specifiers.length; i++) {
		let specifier = specifiers[i];

		if (typeof specifier !== "string") {
			// This allows us to end the chain with actual data / functions
			return specifier;
		}

		try {
			return await import(specifier)
		} catch (error) {
			if (i === specifiers.length - 1) {
				throw error;
			}
		}
	}
}