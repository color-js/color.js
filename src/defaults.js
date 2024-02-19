// Global defaults one may want to configure
export default {
	gamut_mapping: "css",
	precision: 5,
	deltaE: "76", // Default deltaE method
	verbose: globalThis?.process?.env?.NODE_ENV?.toLowerCase() !== "test",
	warn: function warn (msg) {
		if (this.verbose) {
			globalThis?.console?.warn?.(msg);
		}
	},
};
